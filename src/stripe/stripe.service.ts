import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!stripeSecretKey) {
      console.warn('STRIPE_SECRET_KEY not found in environment variables');
    }

    this.stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
      apiVersion: '2025-12-15.clover' as const,
    });
  }

  /**
   * Create a Checkout Session for one-time payments
   */
  async createCheckoutSession(
    lineItems: Array<{ price_data: Stripe.Checkout.SessionCreateParams.LineItem.PriceData; quantity: number }>,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: metadata || {},
      });

      return session;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create checkout session: ${message}`);
    }
  }

  /**
   * Create a Payment Intent for more control over the payment process
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create payment intent: ${message}`);
    }
  }

  /**
   * Create a Coupon
   */
  async createCoupon(
    id: string,
    percentOff?: number,
    amountOff?: number,
    currency?: string,
    duration: 'once' | 'repeating' | 'forever' = 'once',
    durationInMonths?: number,
  ): Promise<Stripe.Coupon> {
    try {
      const params: Stripe.CouponCreateParams = {
        id,
        duration,
      };

      if (percentOff) {
        params.percent_off = percentOff;
      } else if (amountOff) {
        params.amount_off = amountOff;
        params.currency = currency || 'usd';
      } else {
        throw new BadRequestException('Either percentOff or amountOff must be provided');
      }

      if (duration === 'repeating' && durationInMonths) {
        params.duration_in_months = durationInMonths;
      }

      const coupon = await this.stripe.coupons.create(params);
      return coupon;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create coupon: ${message}`);
    }
  }

  /**
   * Create a Refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer',
  ): Promise<Stripe.Refund> {
    try {
      const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        params.amount = Math.round(amount * 100); // Convert to cents
      }

      if (reason) {
        params.reason = reason;
      }

      const refund = await this.stripe.refunds.create(params);
      return refund;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create refund: ${message}`);
    }
  }

  /**
   * Retrieve a Payment Intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to retrieve payment intent: ${message}`);
    }
  }

  /**
   * Retrieve a Checkout Session
   */
  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to retrieve checkout session: ${message}`);
    }
  }
}

