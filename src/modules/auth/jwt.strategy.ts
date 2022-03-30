import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretKey', // TODO: integrate env var properly (https://docs.nestjs.com/techniques/configuration),
    });
  }

  async validate(payload: any) {
    // Here we can code more business logic about JWT (https://docs.nestjs.com/security/authentication#login-route)
    return this.authService.getConnectedUser(payload.id);
  }
}
