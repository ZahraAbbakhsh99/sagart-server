import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CleanupService } from './cleanup.service';
import { CleanupController } from './cleanup.controller';
import { Product } from '../product/entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { Article } from '../article/entities/article.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Product, Category, Article]),
  ],
  controllers: [CleanupController],
  providers: [CleanupService],
  exports: [CleanupService],
})
export class CleanupModule {}