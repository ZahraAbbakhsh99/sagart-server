import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

export class FileDeleteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  filePath!: string;
}

export class FileUpdateDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oldPath!: string;
}