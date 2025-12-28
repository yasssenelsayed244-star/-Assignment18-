import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(
    dto: SignupDto,
  ): Promise<{ id: number; email: string; fullName: string }> {
    const user = await this.usersService.createLocalUser({
      email: dto.email,
      password: dto.password,
      fullName: dto.fullName,
    });
    return { id: user.id, email: user.email, fullName: user.fullName };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException('Email not confirmed');
    }
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  async confirmEmail(
    email: string,
    otp: string,
  ): Promise<{ id: number; email: string; isEmailConfirmed: boolean }> {
    const user = await this.usersService.verifyEmailOtp(email, otp);
    return {
      id: user.id,
      email: user.email,
      isEmailConfirmed: user.isEmailConfirmed,
    };
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    await this.usersService.resendEmailOtp(email);
    return { message: 'OTP sent successfully' };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return;
    }
    const token = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.usersService.setResetPasswordToken(user, token, expiresAt);
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ id: number; email: string }> {
    const user = await this.usersService.resetPassword(token, newPassword);
    return { id: user.id, email: user.email };
  }

  async loginWithGoogle(dto: GoogleLoginDto): Promise<{ accessToken: string }> {
    const fullName = dto.fullName || dto.email;
    const user = await this.usersService.createGoogleUser(
      dto.email,
      dto.googleId,
      fullName,
    );
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  async signupWithGoogle(
    dto: GoogleLoginDto,
  ): Promise<{ accessToken: string }> {
    return this.loginWithGoogle(dto);
  }

  private generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }
}
