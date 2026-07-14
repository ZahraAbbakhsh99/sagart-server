import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { AdminCategoryController } from './categories/admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserModule, CategoryModule,],
  controllers: [AdminController, AdminCategoryController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}