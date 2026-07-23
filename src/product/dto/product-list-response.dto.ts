import { ApiProperty } from '@nestjs/swagger';

export class ProductListResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  measure!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  priceAfterDiscount!: number;

  @ApiProperty({ example: '10%' })
  discountDisplay!: string;

  @ApiProperty({ type: [String], nullable: true })
  images!: string[] | null;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  category!: {
    id: string;
    name: string;
  };

  @ApiProperty({ example: true })
  isFavorite!: boolean;

  @ApiProperty({ example: false })
  isInCart!: boolean;
}