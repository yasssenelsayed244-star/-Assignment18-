import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CreateRefundDto } from './dto/create-refund.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout-session')
  async createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    const lineItems = dto.lineItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    return this.stripeService.createCheckoutSession(
      lineItems,
      dto.successUrl,
      dto.cancelUrl,
      dto.metadata,
    );
  }

  @Post('payment-intent')
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(
      dto.amount,
      dto.currency,
      dto.metadata,
    );
  }

  @Post('coupon')
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.stripeService.createCoupon(
      dto.id,
      dto.percentOff,
      dto.amountOff,
      dto.currency,
      dto.duration,
      dto.durationInMonths,
    );
  }

  @Post('refund')
  async createRefund(@Body() dto: CreateRefundDto) {
    return this.stripeService.createRefund(
      dto.paymentIntentId,
      dto.amount,
      dto.reason,
    );
  }

  @Get('payment-intent/:id')
  async getPaymentIntent(@Param('id') id: string) {
    return this.stripeService.retrievePaymentIntent(id);
  }

  @Get('checkout-session/:id')
  async getCheckoutSession(@Param('id') id: string) {
    return this.stripeService.retrieveCheckoutSession(id);
  }
}

