import { IsEnum, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShippingMethod } from '../entities/shipping-setting.entity';

export class CreateShippingDto {
  @ApiProperty({ enum: ShippingMethod })
  @IsEnum(ShippingMethod)
  @IsNotEmpty()
  method!: ShippingMethod;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  minWeight!: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  maxWeight!: number;

  @ApiProperty({ example: 20000 })
  @IsNumber()
  @Min(0)
  cost!: number;
}