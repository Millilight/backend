import { Test, TestingModule } from '@nestjs/testing';

import { AskResetPasswordUserDto } from './dto/ask-reset-password-user.dto';
import { ConfigModule } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { MailModule } from '../mail/mail.module';
import { User } from '@gqltypes';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
// TODO do not import from auth module
import { VerifyEmailDto } from '../auth/dto/verify-email.dto';
import config from '../../config/config';

const A_USER: User = {
  _id: '624af86f5998c2fdfa851b16',
  firstname: 'Test',
  lastname: 'Test',
  email: 'test@test.fr',
  heirs: undefined,
  legators: undefined,
  urgent_data: {
    user_id: '624af86f5998c2fdfa851b16',
    wishes: undefined,
  },
};

describe('UsersResolver', () => {
  let resolver: UsersResolver;

  beforeEach(async () => {
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
            create: jest.fn(async (user: CreateUserDto) => ({
              ...user,
              _id: '1',
              wishes: {},
              password:
                '$2b$10$7fGhVxVbhBZq2kw1aJvIfuXCiWW/wGhkR9bCMM4LJG.ujEybN2jNy',
            })),
            sendUserConfirmation: jest.fn(async (_user: User) =>
              Promise.resolve()
            ),
            verifyEmail: jest.fn(async (_verify_email_dto: VerifyEmailDto) => ({
              success: true,
            })),
            updateUser: jest.fn(async (_user: User, _user_update: any) => ({
              _id: '624af86f5998c2fdfa851b16',
              firstname: 'changeTest',
              lastname: 'changeTest',
              email: 'test@test.fr',
              wishes: {
                burial_cremation: 'TEST1',
                burial_cremation_place: 'TEST2',
                music: 'TEST3',
              },
              new_email: 'changetest@test.fr',
              new_email_token: 'PThg91RouzyYNM8Iy35Nh8VOso01M6KN',
            })),
            findByIDWithNewEmailAndNewEmailToken: jest.fn(
              async (_new_user_id: string) => ({
                _id: '624af86f5998c2fdfa851b16',
                firstname: 'changeTest',
                lastname: 'changeTest',
                email: 'test@test.fr',
                new_email: 'changetest@test.fr',
                new_email_token: 'PThg91RouzyYNM8Iy35Nh8VOso01M6KN',
              })
            ),
            sendUserEmailUpdate: jest.fn(async (_new_user: User) =>
              Promise.resolve()
            ),
            askResetPassword: jest.fn(
              async (
                _ask_reset_password_user_dto: AskResetPasswordUserDto
              ) => ({
                _id: '624af86f5998c2fdfa851b16',
                firstname: 'Test',
                lastname: 'Test',
                email: 'test@test.fr',
                reset_password_token: 'JLmg8tfHXJOYcd7PMT6mSgNT9qczkyuh',
              })
            ),
            resetPassword: jest.fn(async (_user_id: string, _token: string) =>
              Promise.resolve()
            ),
            checkResetPassword: jest.fn(async (_user: User) => ({
              _id: '624af86f5998c2fdfa851b16',
              firstname: 'changeTest',
              lastname: 'changeTest',
              email: 'test@test.fr',
            })),
            findByIDAndNewMailTokenWithNewEMailAndNewEmailToken: jest.fn(
              async (_user_id: string, _token: string) => ({
                _id: '624af86f5998c2fdfa851b16',
                firstname: 'changeTest',
                lastname: 'changeTest',
                email: 'test@test.fr',
                new_email: 'changetest@test.fr',
                new_email_token: 'PThg91RouzyYNM8Iy35Nh8VOso01M6KN',
              })
            ),
            updateEmailUser: jest.fn(async (_user: User) => ({
              _id: '624af86f5998c2fdfa851b16',
              firstname: 'Test',
              lastname: 'Test',
              email: 'changetest@test.fr',
              wishes: {
                burial_cremation: 'TEST1',
                burial_cremation_place: 'TEST2',
                music: 'TEST3',
              },
            })),
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
      return resolver
        .createUser({
          lastname: 'TestLastname',
          firstname: 'TestFirstname',
          email: 'test@test.fr',
          password: 'Test1234@',
        })
        .then((user) => {
          expect(user._id).toBeDefined();
          expect(user.lastname).toEqual('TestLastname');
          expect(user.firstname).toEqual('TestFirstname');
          expect(user.email).toEqual('test@test.fr');
          expect(user.urgent_data).toBeDefined();
          expect(user.urgent_data.user_id).toEqual(user._id);
        });
    });
  });

  describe('verifyEmail', () => {
    it('should verify the user email', () => {
      return resolver
        .verifyEmail({
          user_id: '624af86f5998c2fdfa851b16',
          token: 'xzYjBolsAUaJFnIVP1MxWWf2Plu0Ro4z',
        })
        .then((data) => {
          expect(data.success).toBe(true);
        });
    });
  });

  describe('update user', () => {
    it('should update the user', () => {
      return resolver
        .updateUser(A_USER, {
          firstname: 'changeTest',
          lastname: 'changeTest',
          password: 'changeTest1234@',
          new_email: 'changetest@test.fr',
        })
        .then((user) => {
          expect(user._id).toEqual('624af86f5998c2fdfa851b16');
          expect(user.firstname).toEqual('changeTest');
          expect(user.lastname).toEqual('changeTest');
          expect(user.email).toEqual('test@test.fr');
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
          user_id: '624af86f5998c2fdfa851b16',
          token: 'JLmg8tfHXJOYcd7PMT6mSgNT9qczkyuh',
          new_password: 'changeTest1234@',
        })
        .then((data) => {
          expect(data._id).toEqual('624af86f5998c2fdfa851b16');
          expect(data.firstname).toEqual('changeTest');
          expect(data.lastname).toEqual('changeTest');
          expect(data.email).toEqual('test@test.fr');
        });
    });
  });

  describe('verifyNewEmail', () => {
    it('should verify token and change email', () => {
      return resolver
        .verifyNewEmail(A_USER, {
          user_id: '624af86f5998c2fdfa851b16',
          token: 'JLmg8tfHXJOYcd7PMT6mSgNT9qczkyuh',
        })
        .then((data) => {
          expect(data._id).toEqual('624af86f5998c2fdfa851b16');
          expect(data.firstname).toEqual('Test');
          expect(data.lastname).toEqual('Test');
          expect(data.email).toEqual('changetest@test.fr');
        });
    });
  });

  //query user
});
