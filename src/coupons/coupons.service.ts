import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async createCoupon(dto: CreateCouponDto): Promise<Coupon> {
    // Check if code already exists
    const existing = await this.couponRepository.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }

    const coupon = this.couponRepository.create({
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    return this.couponRepository.save(coupon);
  }

  async findAll(): Promise<Coupon[]> {
    return this.couponRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.couponRepository.findOne({ where: { code } });
  }

  async validateCoupon(code: string, totalAmount: number): Promise<Coupon> {
    const coupon = await this.findByCode(code);

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is not active');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minimumAmount && totalAmount < Number(coupon.minimumAmount)) {
      throw new BadRequestException(
        `Minimum order amount of ${coupon.minimumAmount} required`,
      );
    }

    return coupon;
  }

  async incrementUsage(id: number): Promise<void> {
    const coupon = await this.findOne(id);
    coupon.usageCount += 1;
    await this.couponRepository.save(coupon);
  }
}

