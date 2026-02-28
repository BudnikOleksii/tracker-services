import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@tracker/shared';

import { GatewayConfigService } from '../config/gateway-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: GatewayConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtAccessSecret,
    });
  }

  validate(payload: JwtPayload): { id: string; email: string; role: string } {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
