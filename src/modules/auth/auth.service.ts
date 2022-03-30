import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './login-response.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    return this.usersService.getWithAuth(email, password);
  }

  async login(user: User): Promise<LoginResponse> {
    const payload = { id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async getConnectedUser(user_id: string): Promise<User> {
    return this.usersService.findByID(user_id);
  }
}
