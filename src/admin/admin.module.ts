import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';
import { AdminCategoryController } from './categories/admin.controller';
import { AdminProductController } from './products/admin-product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), 
            UserModule, 
            CategoryModule,
            ProductModule],
  controllers: [AdminController,
                AdminCategoryController,
                AdminProductController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}