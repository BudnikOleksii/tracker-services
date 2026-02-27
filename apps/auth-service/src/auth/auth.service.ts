import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import type { User } from '@tracker/database';
import {
  EmailService,
  type AuthLoginPayload,
  type AuthRefreshResponse,
  type AuthRefreshTokensPayload,
  type AuthRegisterPayload,
  type AuthResponse,
  type AuthUser,
} from '@tracker/shared';

import { AuthConfigService } from '../config/auth-config.service';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';

const BCRYPT_SALT_ROUNDS = 12;
const EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  async register(data: AuthRegisterPayload): Promise<AuthUser> {
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'User with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const emailVerificationToken = randomUUID();
    const emailVerificationTokenExpiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    const user = await this.usersRepository.create({
      email: data.email,
      passwordHash,
      emailVerificationToken,
      emailVerificationTokenExpiresAt,
      countryCode: data.countryCode as never,
      baseCurrencyCode: data.baseCurrencyCode as never,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    await this.sendVerificationEmail(user.email, emailVerificationToken);

    return this.sanitizeUser(user);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findByEmailVerificationToken(token);

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid verification token',
      });
    }

    if (
      user.emailVerificationTokenExpiresAt &&
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Verification token has expired',
      });
    }

    await this.usersRepository.markEmailVerified(user.id);

    return { message: 'Email verified successfully' };
  }

  async login(data: AuthLoginPayload): Promise<AuthResponse> {
    const user = await this.usersRepository.findByEmail(data.email);
    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }

    if (!user.emailVerified) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Email not verified',
      });
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      data.ipAddress,
      data.userAgent,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refreshTokens(
    data: AuthRefreshTokensPayload,
  ): Promise<AuthRefreshResponse> {
    const existingToken = await this.refreshTokensRepository.findByToken(
      data.refreshToken,
    );

    if (!existingToken) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }

    if (existingToken.revokedAt) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Refresh token has been revoked',
      });
    }

    if (existingToken.expiresAt < new Date()) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Refresh token has expired',
      });
    }

    const user = await this.usersRepository.findById(existingToken.userId);
    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'User not found',
      });
    }

    await this.refreshTokensRepository.revokeByToken(data.refreshToken);

    const tokens = await this.generateTokens(user);
    const newTokenRecord = await this.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      data.ipAddress,
      data.userAgent,
    );

    await this.refreshTokensRepository.markReplaced(
      existingToken.id,
      newTokenRecord.id,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokensRepository.revokeByToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokensRepository.revokeAllByUserId(userId);

    return { message: 'Logged out from all devices' };
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.authConfigService.jwtAccessSecret,
        expiresIn: this.parseExpiresIn(
          this.authConfigService.jwtAccessExpiresIn,
        ),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.authConfigService.jwtRefreshSecret,
        expiresIn: this.parseExpiresIn(
          this.authConfigService.jwtRefreshExpiresIn,
        ),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const expiresAt = this.calculateRefreshTokenExpiry();

    return this.refreshTokensRepository.create({
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    });
  }

  private parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match || !match[1] || !match[2]) {
      return 900;
    }

    const amount = parseInt(match[1], 10);
    const multipliersInSeconds: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return amount * (multipliersInSeconds[match[2]] ?? 1);
  }

  private calculateRefreshTokenExpiry(): Date {
    const seconds = this.parseExpiresIn(
      this.authConfigService.jwtRefreshExpiresIn,
    );

    return new Date(Date.now() + seconds * 1000);
  }

  private sanitizeUser(user: User): AuthUser {
    const {
      passwordHash: _password,
      emailVerificationToken: _token,
      emailVerificationTokenExpiresAt: _tokenExpiry,
      deletedAt: _deleted,
      ...sanitized
    } = user;

    return sanitized;
  }

  private async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const subject = 'Verify your email address';
    const text = `Please verify your email by using this token: ${token}`;
    const html = `<p>Please verify your email by using this token: <strong>${token}</strong></p>`;

    await this.emailService.sendEmail(email, subject, text, html);
  }
}
