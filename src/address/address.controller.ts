import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async findAll(@Request() req) {
    const data = await this.addressService.findAll(req.user.id);
    return { message: 'لیست آدرس‌ها', data };
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateAddressDto) {
    await this.addressService.create(req.user.id, dto);
    return { message: 'آدرس با موفقیت اضافه شد' };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressService.update(id, req.user.id, dto);
    return { message: 'آدرس با موفقیت ویرایش شد', data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const data = await this.addressService.delete(id, req.user.id);
    return { message: data.message };
  }

  @Patch(':id/default')
  async setDefault(@Param('id') id: string, @Request() req) {
    const data = await this.addressService.setDefault(id, req.user.id);
    return { message: 'آدرس پیش‌فرض تنظیم شد', data };
  }
}