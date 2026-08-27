import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { LiaraStorageProvider } from './providers/liara-storage.provider';

@Module({
  imports: [ConfigModule],
  controllers: [FileController],
  providers: [
    FileService,
    {
      provide: 'StorageProvider',
      useClass: LiaraStorageProvider,
    },
  ],
  exports: [FileService],
})
export class FileModule {}