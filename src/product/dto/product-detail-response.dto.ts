import { ApiProperty } from '@nestjs/swagger';

class CategoryBriefDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

export class ProductDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty({ example: '10%' })
  discountDisplay!: string;

  @ApiProperty()
  priceAfterDiscount!: number;

  @ApiProperty()
  measure!: string;

  @ApiProperty({ type: [String], nullable: true })
  images!: string[] | null;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  harvestMethod!: string;

  @ApiProperty()
  storageMethod!: string;

  @ApiProperty()
  specifications!: string;

  @ApiProperty()
  packagingShipping!: string;

  @ApiProperty()
  usageGuide!: string;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ type: CategoryBriefDto })
  category!: CategoryBriefDto;
}