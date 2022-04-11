import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    // Here we can code more business logic about JWT (https://docs.nestjs.com/security/authentication#login-route)
    return await this.authService.getConnectedUser(payload.id);
  }
}
