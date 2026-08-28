import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Product } from '../product/entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Article } from '../article/entities/article.entity';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);
  private s3Client: S3Client;
  private bucket: string;
  private publicEndpoint: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Article)
    private articleRepo: Repository<Article>,
  ) {
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

  private async collectAllFilePathsFromDB(): Promise<Set<string>> {
    const filePaths = new Set<string>();

    const products = await this.productRepo.find({
      select: { images: true },
    });
    for (const product of products) {
      if (product.images?.length) {
        for (const img of product.images) {
          const path = this.extractRelativePath(img);
          if (path) filePaths.add(path);
        }
      }
    }

    const categories = await this.categoryRepo.find({
      select: { image: true, coverImage: true },
    });
    for (const category of categories) {
      if (category.image) {
        const path = this.extractRelativePath(category.image);
        if (path) filePaths.add(path);
      }
      if (category.coverImage) {
        const path = this.extractRelativePath(category.coverImage);
        if (path) filePaths.add(path);
      }
    }

    const articles = await this.articleRepo.find({
      select: { featuredImage: true, videoUrl: true },
    });
    for (const article of articles) {
      if (article.featuredImage) {
        const path = this.extractRelativePath(article.featuredImage);
        if (path) filePaths.add(path);
      }
      if (article.videoUrl) {
        const path = this.extractRelativePath(article.videoUrl);
        if (path) filePaths.add(path);
      }
    }

    this.logger.log(`Total file paths in database: ${filePaths.size}`);
    return filePaths;
  }

  private extractRelativePath(url: string): string | null {
    if (!url) return null;

    if (this.publicEndpoint && url.startsWith(this.publicEndpoint)) {
      return url.replace(`${this.publicEndpoint}/`, '');
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return url;
    }

    return null;
  }

  private async listAllBucketFiles(): Promise<string[]> {
    const files: string[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        ContinuationToken: continuationToken,
      });

      try {
        const response = await this.s3Client.send(command);

        if (response.Contents) {
          for (const item of response.Contents) {
            if (item.Key) {
              files.push(item.Key);
            }
          }
        }

        continuationToken = response.NextContinuationToken;
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        this.logger.error(`Failed to list bucket files: ${errorMessage}`);
        throw new Error(`Failed to list bucket files: ${errorMessage}`);
      }
    } while (continuationToken);

    this.logger.log(`Total bucket files: ${files.length}`);
    return files;
  }

  private async deleteFileFromBucket(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      this.logger.log(`Deleted file: ${key}`);
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logger.error(`Failed to delete file ${key}: ${errorMessage}`);
    }
  }

  async runCleanup(dryRun: boolean = true): Promise<{
    totalBucketFiles: number;
    totalDBFiles: number;
    orphanFiles: string[];
    deletedCount: number;
  }> {
    this.logger.log('Starting cleanup process...');

    const bucketFiles = await this.listAllBucketFiles();
    const dbFiles = await this.collectAllFilePathsFromDB();
    const orphanFiles = bucketFiles.filter((key) => !dbFiles.has(key));

    this.logger.log(`Orphan files found: ${orphanFiles.length}`);

    if (dryRun) {
      this.logger.log('Dry run mode: no files will be deleted');
      return {
        totalBucketFiles: bucketFiles.length,
        totalDBFiles: dbFiles.size,
        orphanFiles,
        deletedCount: 0,
      };
    }

    let deletedCount = 0;
    for (const key of orphanFiles) {
      await this.deleteFileFromBucket(key);
      deletedCount++;
    }

    this.logger.log(`Cleanup completed. ${deletedCount} files deleted.`);
    return {
      totalBucketFiles: bucketFiles.length,
      totalDBFiles: dbFiles.size,
      orphanFiles,
      deletedCount,
    };
  }

  @Cron('0 3 */3 * *')
  async autoCleanup() {
    this.logger.log('Starting scheduled cleanup job...');

    if (process.env.NODE_ENV === 'development') {
      this.logger.log('Development environment: dry run only');
      const result = await this.runCleanup(true);
      this.logger.log(`Dry run result: ${result.orphanFiles.length} orphan files found`);
      return;
    }

    try {
      const result = await this.runCleanup(false);
      this.logger.log(`Cleanup job completed. ${result.deletedCount} files deleted.`);
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logger.error(`Cleanup job failed: ${errorMessage}`);
    }
  }
}