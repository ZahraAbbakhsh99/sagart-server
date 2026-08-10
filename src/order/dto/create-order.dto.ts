import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShippingMethod } from '../../shipping/entities/shipping-setting.entity';

export class CreateOrderDto {
  @ApiProperty({ example: 'address-uuid' })
  @IsUUID()
  addressId!: string;

  @ApiProperty({ enum: ShippingMethod, default: ShippingMethod.NORMAL })
  @IsEnum(ShippingMethod)
  shippingMethod!: ShippingMethod;

  @ApiProperty({ example: 'DISCOUNT10', required: false })
  @IsOptional()
  @IsString()
  discountCode?: string;
}