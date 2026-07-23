import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFavoriteDto {
  @ApiProperty({ example: 'product-uuid' })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;
}