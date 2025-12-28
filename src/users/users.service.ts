import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { UsersRepository } from './repositories/users.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createLocalUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otp = randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return this.usersRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      otp,
      otpExpiresAt,
      isEmailConfirmed: false,
    });
  }

  async createGoogleUser(
    email: string,
    googleId: string,
    fullName: string,
  ): Promise<User> {
    const existingByGoogle =
      await this.usersRepository.findByGoogleId(googleId);
    if (existingByGoogle) {
      return existingByGoogle;
    }
    const existingByEmail = await this.usersRepository.findByEmail(email);
    if (existingByEmail) {
      existingByEmail.googleId = googleId;
      existingByEmail.isEmailConfirmed = true;
      return this.usersRepository.save(existingByEmail);
    }
    return this.usersRepository.create({
      email,
      fullName,
      googleId,
      isEmailConfirmed: true,
    });
  }

  async verifyEmailOtp(email: string, otp: string): Promise<User> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    if (user.isEmailConfirmed) {
      return user;
    }
    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }
    user.isEmailConfirmed = true;
    user.otp = null;
    user.otpExpiresAt = null;
    return this.usersRepository.save(user);
  }

  async resendEmailOtp(email: string): Promise<string> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }
    const otp = randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.usersRepository.save(user);
    return otp;
  }

  async setResetPasswordToken(
    user: User,
    token: string,
    expiresAt: Date,
  ): Promise<User> {
    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = expiresAt;
    return this.usersRepository.save(user);
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.usersRepository.findByResetPasswordToken(token);
    if (
      !user ||
      !user.resetPasswordExpiresAt ||
      user.resetPasswordExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    return this.usersRepository.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }
    return this.usersRepository.save(user);
  }
}
