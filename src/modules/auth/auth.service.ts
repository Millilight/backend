import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './login-response.schema';
import { User } from 'src/graphql';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    return await this.usersService.getWithAuth(email, password);
  }

  login(user: User): LoginResponse {
    const payload = { id: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async getConnectedUser(user_id: string): Promise<User> {
    return await this.usersService.findByID(user_id);
  }
}
