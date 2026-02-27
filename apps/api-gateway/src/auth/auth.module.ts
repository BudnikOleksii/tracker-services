import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { GatewayConfigService } from '../config/gateway-config.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [GatewayConfigService],
      useFactory: (config: GatewayConfigService) => ({
        secret: config.jwtAccessSecret,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy],
})
export class AuthModule {}
