import { Controller, Post, Delete, Body, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileUploadDto, FileDeleteDto, FileUpdateDto } from './dto/file-upload.dto';
import { validateFile } from './validators/file-validation.config';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('file')
@Controller('file')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, AdminGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  private getBaseUrl(): string {
    return process.env.BASE_URL || 'http://localhost:3000';
  }

  @Post('upload/image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('فایلی ارسال نشده است');
    validateFile(file, 'image');
    const filePath = await this.fileService.upload(file, 'images');
    const url = `${this.getBaseUrl()}/${filePath}`;
    return { message: 'تصویر با موفقیت آپلود شد', data: {filePath, url} };
  }

  @Post('upload/video')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('فایلی ارسال نشده است');
    validateFile(file, 'video');
    const filePath = await this.fileService.upload(file, 'videos');
    const url = `${this.getBaseUrl()}/${filePath}`;
    return { message: 'ویدیو با موفقیت آپلود شد', data: {filePath, url} };
  }

  @Delete('delete')
  async deleteFile(@Body() deleteDto: FileDeleteDto) {
    await this.fileService.delete(deleteDto.filePath);
    return { message: 'فایل با موفقیت حذف شد' };
  }

  @Post('update')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUpdateDto })
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDto: FileUpdateDto,
  ) {
    if (!file) throw new BadRequestException('فایلی ارسال نشده است');
    if (!updateDto.oldPath) throw new BadRequestException('مسیر فایل قبلی ارسال نشده است');
    validateFile(file, 'general');

    const pathParts = updateDto.oldPath.split('/');
    const folder = pathParts.length > 1 ? pathParts[1] : 'general';
    
    const filePath = await this.fileService.update(updateDto.oldPath, file, folder);
    const url = `${this.getBaseUrl()}/${filePath}`;
    return { message: 'فایل با موفقیت به‌روزرسانی شد', data: {filePath, url} };
  }
}