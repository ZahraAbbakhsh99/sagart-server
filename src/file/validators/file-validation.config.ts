import { BadRequestException } from '@nestjs/common';

export const fileValidationConfig = {
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 20 * 1024 * 1024, // 20 MB
  },
  video: {
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'],
    extensions: ['.mp4', '.mov', '.avi', '.webm', '.mkv'],
    maxSize: 200 * 1024 * 1024, // 200 MB
  },
  
  general: {
    mimeTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    extensions: ['.jpg', '.png', '.mp4'],
    maxSize: 20 * 1024 * 1024, // 20 MB
  },
};

export type FileType = keyof typeof fileValidationConfig;

export function validateFile(file: Express.Multer.File, type: FileType = 'general') {
  const config = fileValidationConfig[type];
  if (!config) {
    throw new BadRequestException('نوع فایل نامعتبر است');
  }

  const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
  if (!config.extensions.includes(ext)) {
    throw new BadRequestException(`پسوند فایل مجاز نیست. پسوندهای مجاز: ${config.extensions.join(', ')}`);
  }

  if (!config.mimeTypes.includes(file.mimetype)) {
    throw new BadRequestException(`نوع MIME فایل مجاز نیست. انواع مجاز: ${config.mimeTypes.join(', ')}`);
  }

  if (file.size > config.maxSize) {
    const maxMB = (config.maxSize / (1024 * 1024)).toFixed(0);
    throw new BadRequestException(`حجم فایل نباید بیشتر از ${maxMB} مگابایت باشد`);
  }

  return true;
}