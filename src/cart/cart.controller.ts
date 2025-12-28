import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  addToCart(@GetUser('id') userId: number, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(userId, dto);
  }

  @Get()
  getCart(@GetUser('id') userId: number) {
    return this.cartService.getCart(userId);
  }

  @Patch(':id')
  updateCartItem(
    @GetUser('id') userId: number,
    @Param('id', new ParseIntPipe()) cartId: number,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateCartItem(userId, cartId, quantity);
  }

  @Delete(':id')
  removeFromCart(
    @GetUser('id') userId: number,
    @Param('id', new ParseIntPipe()) cartId: number,
  ) {
    return this.cartService.removeFromCart(userId, cartId);
  }

  @Delete()
  clearCart(@GetUser('id') userId: number) {
    return this.cartService.clearCart(userId);
  }
}

