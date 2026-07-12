import { IsPhoneNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsPhoneNumber('IR')
  phone!: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}