import { IsString } from 'class-validator';

export class ConfirmEmailDto {
  @IsString()
  email: string;

  @IsString()
  otp: string;
}
