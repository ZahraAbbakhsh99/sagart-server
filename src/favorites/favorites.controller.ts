import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Request() req) {
    const data = await this.favoritesService.getFavorites(req.user.id);
    return { message: 'لیست علاقمندی‌ها', data };
  }

  @Post('items')
  async addFavorite(@Request() req, @Body() dto: AddFavoriteDto) {
    await this.favoritesService.addFavorite(req.user.id, dto);
    return { message: 'محصول به علاقمندی‌ها اضافه شد' };
  }

  @Delete('items/:productId')
  async removeFavorite(@Request() req, @Param('productId') productId: string) {
    const data = await this.favoritesService.removeFavorite(req.user.id, productId);
    return { message: 'محصول از علاقمندی‌ها حذف شد', data };
  }
}