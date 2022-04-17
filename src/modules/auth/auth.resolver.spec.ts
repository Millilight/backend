import * as mocks_auth from '../../../__utils__/mocks.auth';

import { AN_USER, A_JWT } from '../../../__utils__/consts';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useFactory: () => ({
            login: mocks_auth.login,
          }),
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined before each', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should update the wishes', () => {
      expect(
        resolver.login(
          {
            email: 'test@test.fr',
            password: 'Test1324!',
          },
          { user: AN_USER }
        )
      ).toEqual({ access_token: A_JWT, user: AN_USER });
    });
  });
});
