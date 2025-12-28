import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Cart } from '../cart/entities/cart.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { Product } from '../products/entities/product.entity';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
    @Inject(CouponsService)
    private readonly couponsService: CouponsService,
  ) {}

  async createOrder(userId: number, dto: CreateOrderDto): Promise<Order> {
    // Get user's cart items
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const cartItem of cartItems) {
      if (!cartItem.product.isActive) {
        throw new BadRequestException(`Product ${cartItem.product.name} is not available`);
      }
      totalAmount += Number(cartItem.product.price) * cartItem.quantity;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let coupon: Coupon | null = null;
    if (dto.couponId) {
      coupon = await this.couponRepository.findOne({
        where: { id: dto.couponId, isActive: true },
      });

      if (!coupon) {
        throw new NotFoundException('Coupon not found or inactive');
      }

      // Check if coupon is expired
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new BadRequestException('Coupon has expired');
      }

      // Calculate discount
      if (coupon.discountType === 'percentage') {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
      } else {
        discountAmount = coupon.discountValue;
      }

      // Ensure discount doesn't exceed total
      if (discountAmount > totalAmount) {
        discountAmount = totalAmount;
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // Create order using transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create order
      const order = this.orderRepository.create({
        userId,
        totalAmount: finalAmount,
        discountAmount,
        couponId: coupon?.id || null,
        status: OrderStatus.PENDING,
        shippingAddress: dto.shippingAddress || null,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      // Create order items
      const orderItems = cartItems.map((cartItem) =>
        this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        }),
      );

      await queryRunner.manager.save(OrderItem, orderItems);

      // Clear cart
      await queryRunner.manager.delete(Cart, { userId });

      // Increment coupon usage if coupon was used
      if (coupon) {
        await this.couponsService.incrementUsage(coupon.id);
      }

      await queryRunner.commitTransaction();

      // Return order with relations
      return this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'items.product', 'coupon'],
      }) as Promise<Order>;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product', 'coupon'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'items.product', 'coupon'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }
}

