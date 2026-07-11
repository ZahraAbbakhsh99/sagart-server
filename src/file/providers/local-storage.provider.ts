import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly basePath = './public/uploads';

  async upload(file: Express.Multer.File, folder: string = 'products'): Promise<string> {
    const uploadDir = path.join(this.basePath, folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    const fullPath = path.join(uploadDir, uniqueName);
    const relativePath = `uploads/${folder}/${uniqueName}`;

    await fs.writeFile(fullPath, file.buffer);
    return relativePath;
  }

  async delete(filePath: string): Promise<void> {
    if (!filePath) return;
    const fullPath = path.join('./public', filePath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.warn(`File not found for deletion: ${fullPath}`);
    }
  }

  async update(oldPath: string, newFile: Express.Multer.File, folder: string = 'general'): Promise<string> {
    await this.delete(oldPath);
    return this.upload(newFile, folder);
  }
}