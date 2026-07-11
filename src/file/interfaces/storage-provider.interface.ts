
export interface StorageProvider {
  upload(file: Express.Multer.File, folder?: string): Promise<string>;
  delete(filePath: string): Promise<void>;
  update(oldPath: string, newFile: Express.Multer.File, folder?: string): Promise<string>;
}