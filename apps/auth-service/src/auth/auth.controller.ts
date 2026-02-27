import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MESSAGE_PATTERNS } from '@tracker/shared';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: MESSAGE_PATTERNS.AUTH.REGISTER })
  async register(
    @Payload()
    data: {
      email: string;
      password: string;
      countryCode?: string;
      baseCurrencyCode?: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: MESSAGE_PATTERNS.AUTH.VERIFY_EMAIL })
  async verifyEmail(@Payload() data: { token: string }) {
    return this.authService.verifyEmail(data.token);
  }

  @MessagePattern({ cmd: MESSAGE_PATTERNS.AUTH.LOGIN })
  async login(
    @Payload()
    data: {
      email: string;
      password: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: MESSAGE_PATTERNS.AUTH.REFRESH })
  async refresh(
    @Payload()
    data: {
      refreshToken: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ) {
    return this.authService.refreshTokens(data);
  }

  @MessagePattern({ cmd: MESSAGE_PATTERNS.AUTH.LOGOUT })
  async logout(@Payload() data: { refreshToken: string }) {
    return this.authService.logout(data.refreshToken);
  }

  @MessagePattern({ cmd: MESSAGE_PATTERNS.AUTH.LOGOUT_ALL })
  async logoutAll(@Payload() data: { userId: string }) {
    return this.authService.logoutAll(data.userId);
  }
}
