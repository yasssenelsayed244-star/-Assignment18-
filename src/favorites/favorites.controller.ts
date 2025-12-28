import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle/:productId')
  toggleFavorite(
    @GetUser('id') userId: number,
    @Param('productId', new ParseIntPipe()) productId: number,
  ) {
    return this.favoritesService.toggleFavorite(userId, productId);
  }

  @Get()
  getUserFavorites(@GetUser('id') userId: number) {
    return this.favoritesService.getUserFavorites(userId);
  }
}

