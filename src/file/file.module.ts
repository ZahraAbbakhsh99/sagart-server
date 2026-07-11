import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Module({
  controllers: [FileController],
  providers: [FileService, LocalStorageProvider],
  exports: [FileService],
})
export class FileModule {}