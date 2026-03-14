import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { SharedModule } from '@tracker/shared';

import { AuthConfigService } from '../config/auth-config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HibpService } from './hibp.service';
import { LockoutService } from './lockout.service';
import { SuspiciousLoginService } from './suspicious-login.service';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';
import { LoginAttemptsRepository } from './repositories/login-attempts.repository';
import { KnownDevicesRepository } from './repositories/known-devices.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AuthConfigService],
      useFactory: (config: AuthConfigService) => ({
        secret: config.jwtAccessSecret,
      }),
    }),
    HttpModule,
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    HibpService,
    LockoutService,
    SuspiciousLoginService,
    UsersRepository,
    RefreshTokensRepository,
    LoginAttemptsRepository,
    KnownDevicesRepository,
  ],
})
export class AuthModule {}
