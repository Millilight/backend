import * as mocks_auth from '../../../__utils__/mocks.auth';
import * as mocks_users from '../../../__utils__/mocks.users';

import { AN_USER, A_JWT } from '../../../__utils__/consts';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

describe('UserService', () => {
  let service: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useFactory: () => ({
            getWithAuth: mocks_users.getWithAuth,
            findByID: mocks_users.findByID,
          }),
        },
        {
          provide: JwtService,
          useFactory: () => ({
            sign: mocks_auth.sign,
          }),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined: fixtures and service', () => {
    expect(service).toBeDefined();
  });

  /* Tests all services*/
  describe('validateUser', () => {
    it('should return the user authenticated', () => {
      return service.validateUser('test@test.fr', 'Test1234!').then((user) => {
        expect(user).toEqual(AN_USER);
      });
    });
  });

  describe('login', () => {
    it('should return new wishes', () => {
      expect(service.login(AN_USER)).toEqual({
        access_token: A_JWT,
        user: AN_USER,
      });
    });
  });

  describe('getConnectedUser', () => {
    it('should return the user authenticated', () => {
      return service.getConnectedUser(AN_USER._id).then((user) => {
        expect(user).toEqual(AN_USER);
      });
    });
  });
});
