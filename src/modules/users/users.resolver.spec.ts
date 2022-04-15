import * as mocks_mail from '../../../__utils__/mocks.mail';
import * as mocks_users from '../../../__utils__/mocks.users';

import { AN_USER, A_TOKEN } from '../../../__utils__/consts';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import config from '../../config/config';

describe('UsersResolver', () => {
  let resolver: UsersResolver;
  let sendUserEmailUpdate: jest.Mock;

  beforeEach(async () => {
    sendUserEmailUpdate = mocks_mail.sendUserEmailUpdate;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [config],
          isGlobal: true,
        }),
        MailModule,
      ],
      providers: [
        UsersResolver,
        {
          provide: UsersService,
          useFactory: () => ({
            create: mocks_users.create,
            getSignupMailToken: mocks_users.getSignupMailToken,
            verifyEmail: mocks_users.verifyEmail,
            getWithAuth: mocks_users.getWithAuth,
            update: mocks_users.update,
            getNewEmailAndToken: mocks_users.getNewEmailAndToken,
            askResetPassword: mocks_users.askResetPassword,
            verifyTokenAndResetPassword:
              mocks_users.verifyTokenAndResetPassword,
            verifyNewEmail: mocks_users.verifyNewEmail,
          }),
        },
        {
          provide: MailService,
          useFactory: () => ({
            sendUserConfirmation: mocks_mail.sendUserConfirmation,
            sendUserEmailUpdate: sendUserEmailUpdate,
            resetPassword: mocks_mail.resetPassword,
          }),
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined: resolver', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', () => {
      const user = resolver.user(AN_USER);
      expect(user).toEqual(AN_USER);
    });
  });

  describe('createUser', () => {
    it('should create a user', () => {
      return resolver
        .createUser({
          lastname: AN_USER.lastname,
          firstname: AN_USER.firstname,
          email: AN_USER.email,
          password: 'Test1234@',
        })
        .then((user) => {
          expect(user).toEqual(AN_USER);
        });
    });
  });

  describe('verifyEmail', () => {
    it('should verify the user email', () => {
      return resolver
        .verifyEmail({
          user_id: AN_USER._id,
          token: A_TOKEN,
        })
        .then((data) => {
          expect(data.success).toBe(true);
        });
    });
  });

  describe('update user', () => {
    it('should update the user', () => {
      return resolver
        .updateUser(AN_USER, {
          firstname: 'changeTestfirst',
          lastname: 'changeTestlast',
          password: 'changeTest1234@',
        })
        .then((user) => {
          expect(user).toEqual({
            ...AN_USER,
            firstname: 'changeTestfirst',
            lastname: 'changeTestlast',
          });

          expect(sendUserEmailUpdate.mock.calls.length).toBe(0);
        });
    });

    it('should send a mail if mail is changed', () => {
      return resolver
        .updateUser(AN_USER, {
          firstname: 'changeTestfirst',
          lastname: 'changeTestlast',
          password: 'changeTest1234@',
          new_email: 'changetest@test.fr',
        })
        .then((user) => {
          expect(user).toEqual({
            ...AN_USER,
            firstname: 'changeTestfirst',
            lastname: 'changeTestlast',
          });

          expect(sendUserEmailUpdate.mock.calls.length).toBe(1);
        });
    });
  });

  describe('askResetPasswordUser', () => {
    it('should return a success', () => {
      return resolver
        .askResetPasswordUser({
          email: 'test@test.fr',
        })
        .then((data) => {
          expect(data.success).toBe(true);
        });
    });
  });

  describe('resetPasswordUser', () => {
    it('should return the updated user', () => {
      return resolver
        .resetPasswordUser({
          user_id: AN_USER._id,
          token: A_TOKEN,
          new_password: 'changeTest1234@',
        })
        .then((data) => {
          expect(data).toEqual({ ...AN_USER });
        });
    });
  });

  describe('verifyNewEmail', () => {
    it('should verify token and change email', () => {
      return resolver
        .verifyNewEmail(AN_USER, {
          user_id: AN_USER._id,
          token: A_TOKEN,
        })
        .then((data) => {
          expect(data).toEqual(AN_USER);
        });
    });
  });
});
