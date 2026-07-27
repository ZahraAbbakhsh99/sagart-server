import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'علی رضایی' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: '09123456789' })
  @IsPhoneNumber('IR')
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'تهران' })
  @IsString()
  @IsNotEmpty()
  province!: string;

  @ApiProperty({ example: 'تهران' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'خیابان ولیعصر، پلاک ۱۲۳، واحد ۵' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'کدپستی باید ۱۰ رقم باشد' })
  postalCode!: string;

  @ApiProperty({ example: 35.6892, required: false })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ example: 51.3890, required: false })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  isDefault?: boolean;
}