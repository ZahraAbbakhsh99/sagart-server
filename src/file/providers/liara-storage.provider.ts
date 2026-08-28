import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { StorageProvider } from '../interfaces/storage-provider.interface';

@Injectable()
export class LiaraStorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private bucket: string;
  private publicEndpoint: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('LIARA_ENDPOINT');
    const accessKey = this.configService.get<string>('LIARA_ACCESS_KEY');
    const secretKey = this.configService.get<string>('LIARA_SECRET_KEY');
    const bucket = this.configService.get<string>('LIARA_BUCKET_NAME');
    const publicEndpoint = this.configService.get<string>('LIARA_PUBLIC_ENDPOINT');

    if (!endpoint || !accessKey || !secretKey || !bucket || !publicEndpoint) {
      throw new Error('Missing Liara S3 environment variables');
    }

    this.bucket = bucket;
    this.publicEndpoint = publicEndpoint;

    this.s3Client = new S3Client({
      region: 'default',
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }

  async upload(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    if (!file) throw new Error('فایلی ارسال نشده است');

    const extension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${extension}`;

    const params = {
      Body: file.buffer,
      Bucket: this.bucket,
      Key: fileName,
      ContentType: file.mimetype,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      return fileName;
    } catch (error) {
      console.error('خطا در آپلود به لیارا:', error);
      throw new Error('خطا در آپلود فایل');
    }
  }

  async delete(filePath: string): Promise<void> {
    if (!filePath) return;

    let key = filePath;
    if (filePath.startsWith(this.publicEndpoint)) {
      key = filePath.replace(`${this.publicEndpoint}/`, '');
    }

    if (!key.startsWith('images/') && !key.startsWith('videos/') && !key.startsWith('general/')) {
      throw new Error('آدرس فایل معتبر نیست');
    }

    const params = {
      Bucket: this.bucket,
      Key: key,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('خطا در حذف فایل از لیارا:', error);
      throw new Error('خطا در حذف فایل');
    }
  }

  async update(oldPath: string, newFile: Express.Multer.File, folder: string = 'general'): Promise<string> {
    await this.delete(oldPath);
    return this.upload(newFile, folder);
  }
}