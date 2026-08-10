import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingSetting } from './entities/shipping-setting.entity';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingSetting])],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}