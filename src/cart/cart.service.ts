import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addToCart(userId: number, dto: AddToCartDto): Promise<Cart> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if item already exists in cart
    const existingCartItem = await this.cartRepository.findOne({
      where: {
        userId,
        productId: dto.productId,
      },
    });

    if (existingCartItem) {
      // Update quantity
      existingCartItem.quantity += dto.quantity;
      return this.cartRepository.save(existingCartItem);
    }

    // Create new cart item
    const cartItem = this.cartRepository.create({
      userId,
      productId: dto.productId,
      quantity: dto.quantity,
    });

    return this.cartRepository.save(cartItem);
  }

  async getCart(userId: number): Promise<Cart[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.brand', 'product.category'],
    });
  }

  async updateCartItem(
    userId: number,
    cartId: number,
    quantity: number,
  ): Promise<Cart> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cartItem.quantity = quantity;
    return this.cartRepository.save(cartItem);
  }

  async removeFromCart(userId: number, cartId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.delete({ userId });
  }
}

