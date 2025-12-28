import { IsNumber, IsString, IsOptional, IsObject, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

