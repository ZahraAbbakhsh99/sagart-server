import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ 
    example: 'نام انتخابی کاربر', 
    required: false 
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}