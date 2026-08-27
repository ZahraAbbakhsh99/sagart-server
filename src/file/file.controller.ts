import { Controller, Post, Delete, Body, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileUploadDto, FileDeleteDto, FileUpdateDto } from './dto/file-upload.dto';
import { validateFile } from './validators/file-validation.config';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('file')
@Controller('file')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  private getFullUrl(filePath: string): string {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const fileBaseUrl = process.env.File_BASE_URL;
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${fileBaseUrl}${normalizedPath}`;
  }

  @Post('upload/image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('فایلی ارسال نشده است');
    validateFile(file, 'image');
    const filePath = await this.fileService.upload(file, 'images');
    const url = this.getFullUrl(filePath);
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
    const url = this.getFullUrl(filePath);
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
    const url = this.getFullUrl(filePath);
    return { message: 'فایل با موفقیت به‌روزرسانی شد', data: {filePath, url} };
  }
}