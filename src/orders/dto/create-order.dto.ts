import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  couponId?: number;

  @IsOptional()
  @IsString()
  shippingAddress?: string;
}

