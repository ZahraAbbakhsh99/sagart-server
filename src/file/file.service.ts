import { Injectable, Inject } from '@nestjs/common';
import { StorageProvider } from './interfaces/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Injectable()
export class FileService {
  constructor(
    @Inject(LocalStorageProvider)
    private readonly storage: StorageProvider,
  ) {}

  async upload(file: Express.Multer.File, folder: string = 'general') {
    return this.storage.upload(file, folder);
  }

  async delete(filePath: string) {
    return this.storage.delete(filePath);
  }

  async update(oldPath: string, newFile: Express.Multer.File, folder: string = 'general') {
    return this.storage.update(oldPath, newFile, folder);
  }
}