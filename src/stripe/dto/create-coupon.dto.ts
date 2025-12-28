import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentOff?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountOff?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(['once', 'repeating', 'forever'])
  duration?: 'once' | 'repeating' | 'forever';

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationInMonths?: number;
}

