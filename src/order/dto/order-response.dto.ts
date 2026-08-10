import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';
import { ShippingMethod } from '../../shipping/entities/shipping-setting.entity';

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  addressId!: string;

  @ApiProperty()
  address!: {
    fullName: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  };

  @ApiProperty()
  totalPrice!: number;

  @ApiProperty()
  discountAmount!: number;

  @ApiProperty()
  finalPrice!: number;

  @ApiProperty()
  shippingCost!: number;

  @ApiProperty({ enum: ShippingMethod })
  shippingMethod!: ShippingMethod;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiProperty()
  trackingCode!: string;

  @ApiProperty()
  paidAt!: Date;

  @ApiProperty({ type: [Object] })
  items!: {
    id: string;
    productId: string;
    product: {
      id: string;
      title: string;
      slug: string;
      measure: string;
      image: string;
    };
    quantity: number;
    priceAtOrder: number;
    discountPercentAtOrder: number;
    finalPriceAtOrder: number;
    totalPriceAtOrder: number;
  }[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}