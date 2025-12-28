import { IsString, IsArray, IsOptional, IsObject, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class LineItemDto {
  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCheckoutSessionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems: LineItemDto[];

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

