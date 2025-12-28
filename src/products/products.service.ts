import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductsService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  private readonly CACHE_KEY_PREFIX = 'products:';

  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    @Inject(RedisService)
    private readonly redisService: RedisService,
  ) { }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repository.create(dto);
    const savedProduct = await this.repository.save(product);
    
    // Invalidate cache
    await this.invalidateCache();
    
    return savedProduct;
  }

  async findAll(): Promise<Product[]> {
    return this.repository.find({ relations: ['brand', 'category'] });
  }

  async getAllProducts(): Promise<Product[]> {
    return this.findAll();
  }

  async getProductsWithCache(): Promise<Product[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}all`;
    
    // Try to get from cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, fetch from database
    const products = await this.repository.find({
      relations: ['brand', 'category'],
    });

    // Store in cache
    await this.redisService.set(
      cacheKey,
      JSON.stringify(products),
      this.CACHE_TTL,
    );

    return products;
  }

  async findOne(id: number): Promise<Product> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    
    // Try to get from cache
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, fetch from database
    const product = await this.repository.findOne({
      where: { id },
      relations: ['brand', 'category'],
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Store in cache
    await this.redisService.set(
      cacheKey,
      JSON.stringify(product),
      this.CACHE_TTL,
    );

    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    const updatedProduct = await this.repository.save(product);
    
    // Invalidate cache for this product and all products
    await this.invalidateCache(id);
    
    return updatedProduct;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.repository.remove(product);
    
    // Invalidate cache
    await this.invalidateCache(id);
  }

  private async invalidateCache(productId?: number): Promise<void> {
    // Invalidate all products cache
    await this.redisService.del(`${this.CACHE_KEY_PREFIX}all`);
    
    // Invalidate specific product cache if provided
    if (productId) {
      await this.redisService.del(`${this.CACHE_KEY_PREFIX}${productId}`);
    }
  }
}
