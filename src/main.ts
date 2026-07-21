import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // in production make it true
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Sagart API')
    .setDescription('API documentation for Sagart online store (saffron, barberry, jujube, souvenirs)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // try {
  //   const jwt = require('jsonwebtoken');
  //   const adminToken = jwt.sign(
  //     { sub: 'admin-id', role: 'admin' },
  //     process.env.JWT_SECRET_ADMIN || 'secret',
  //     { expiresIn: process.env.JWT_EXPIRES_IN_ADMIN || '1d' }
  //   );
  //   console.log('Admin test token (copy this for auth):');
  //   console.log(adminToken);
  // } catch (e) {
  //   console.warn('JWT secret not set or jsonwebtoken not installed, skipping admin token generation.');
  // }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Sagart server running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();