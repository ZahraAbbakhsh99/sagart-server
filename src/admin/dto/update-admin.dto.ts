import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminDto {
  @ApiProperty({ example: 'admin_new', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'new_password_123', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}