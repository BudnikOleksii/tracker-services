import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthConfigService } from '../config/auth-config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepository } from './repositories/users.repository';
import { RefreshTokensRepository } from './repositories/refresh-tokens.repository';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AuthConfigService],
      useFactory: (config: AuthConfigService) => ({
        secret: config.jwtAccessSecret,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, RefreshTokensRepository],
})
export class AuthModule {}
