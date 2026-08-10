import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';
import { ReviewModule } from '../review/review.module';
import { ArticleModule } from '../article/article.module';
import { ShippingModule } from '../shipping/shipping.module';
import { OrderModule } from '../order/order.module';

import { AdminCategoryController } from './categories/admin.controller';
import { AdminProductController } from './products/admin-product.controller';
import { AdminReviewController } from './reviews/admin-review.controller';
import { AdminArticleController } from './articles/admin-article.controller';
import { AdminShippingController } from './shipping/admin-shipping.controller';
import { AdminOrderController } from './order/admin-order.controller';


@Module({
  imports: [TypeOrmModule.forFeature([User]), 
            UserModule, 
            CategoryModule,
            ProductModule,
            ReviewModule,
            ArticleModule,
            ShippingModule,
            OrderModule],
  controllers: [AdminController,
                AdminCategoryController,
                AdminProductController,
                AdminReviewController,
                AdminArticleController,
                AdminShippingController,
                AdminOrderController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}