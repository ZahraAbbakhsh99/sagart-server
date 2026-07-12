import { IsPhoneNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '09123456789' })
  @IsPhoneNumber('IR')
  @IsNotEmpty()
  phone!: string;
}