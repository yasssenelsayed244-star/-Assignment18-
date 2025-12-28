import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async toggleFavorite(userId: number, productId: number): Promise<{ isFavorite: boolean }> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if favorite already exists
    const existing = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      // Remove from favorites
      await this.favoriteRepository.remove(existing);
      return { isFavorite: false };
    } else {
      // Add to favorites
      const favorite = this.favoriteRepository.create({
        userId,
        productId,
      });
      await this.favoriteRepository.save(favorite);
      return { isFavorite: true };
    }
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['product', 'product.brand', 'product.category'],
    });
  }

  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });
    return !!favorite;
  }
}

