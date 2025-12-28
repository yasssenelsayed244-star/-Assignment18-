import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  paymentIntentId: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsEnum(['duplicate', 'fraudulent', 'requested_by_customer'])
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

