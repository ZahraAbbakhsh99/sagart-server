import { IsUUID, IsInt, Min, Max, IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 'سارا صبوری' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: 'محصول بسیار عالی بود، پیشنهاد میکنم' })
  @IsString()
  @IsNotEmpty()
  @Length(5, 1000)
  comment!: string;
}