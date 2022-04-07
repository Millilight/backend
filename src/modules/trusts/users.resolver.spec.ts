import { Test, TestingModule } from '@nestjs/testing';

import { AskResetPasswordUserDto } from './dto/ask-reset-password-user.dto';
import { ConfigModule } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { MailModule } from '../mail/mail.module';
import { UpdateWishesDto } from './dto/update-wishes.dto';
import { User } from './schemas/user.schema';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { VerifyEmailDto } from '../auth/verify-email.dto';
import config from '../../config/config';

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
            verifyEmail: jest.fn(async (_verify_email_dto : VerifyEmailDto) => ({
              success: true
            })),
            updateUser: jest.fn(async (_user: User, _user_update : any) => (
              {
                _id: "624af86f5998c2fdfa851b16",
                firstname: "changeTest",
                lastname: "changeTest",
                email: "test@test.fr",
                wishes: {
                  burial_cremation: "TEST1",
                  burial_cremation_place: "TEST2",
                  music: "TEST3"
                },
                new_email: "changetest@test.fr",
                new_email_token : "PThg91RouzyYNM8Iy35Nh8VOso01M6KN"
              }
            )),
            findByIDWithNewEmailAndNewEmailToken: jest.fn(async (_new_user_id: string) => ({
                _id: "624af86f5998c2fdfa851b16",
                firstname: "changeTest",
                lastname: "changeTest",
                email: "test@test.fr",
                new_email: "changetest@test.fr",
                new_email_token : "PThg91RouzyYNM8Iy35Nh8VOso01M6KN",
              }
            )),
            sendUserEmailUpdate: jest.fn(async (_new_user: User) =>
              Promise.resolve()
            ),
            askResetPassword: jest.fn(async (_ask_reset_password_user_dto: AskResetPasswordUserDto) => ({
                _id: "624af86f5998c2fdfa851b16",
                firstname: "Test",
                lastname: "Test",
                email: "test@test.fr",
                reset_password_token: "JLmg8tfHXJOYcd7PMT6mSgNT9qczkyuh"
              }
            )),
            resetPassword: jest.fn(async (_user_id: string, _token: string) => 
              Promise.resolve()
            ),
            checkResetPassword: jest.fn(async (_user : User) => ({
                _id: "624af86f5998c2fdfa851b16",
                firstname: "changeTest",
                lastname: "changeTest",
                email: "test@test.fr",
              })
            ),
            findByIDAndNewMailTokenWithNewEMailAndNewEmailToken: jest.fn(async (_user_id: string, _token: string) => ({
                _id: "624af86f5998c2fdfa851b16",
                firstname: "changeTest",
                lastname: "changeTest",
                email: "test@test.fr",
                new_email: "changetest@test.fr",
                new_email_token : "PThg91RouzyYNM8Iy35Nh8VOso01M6KN",
              }
            )),
            updateEmailUser: jest.fn(async (_user: User) => (
              {
                _id: "624af86f5998c2fdfa851b16",
                firstname: "Test",
                lastname: "Test",
                email: "changetest@test.fr",
                wishes: {
                  burial_cremation: "TEST1",
                  burial_cremation_place: "TEST2",
                  music: "TEST3"
                },
              }
            )),
          }),
        },
      ],
    }).compile();

    resolver = module.get<UsersResolver>(UsersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('create user', () => {
    it('should create a user', () => {
      return resolver
        .createUser({
          lastname: 'TestLastname',
          firstname: 'TestFirstname',
          email: 'test@test.fr',
          password: 'Test1234@',
        })
        .then((data) => {
          expect(data._id).toBeDefined();
          expect(data.lastname).toEqual('TestLastname');
          expect(data.firstname).toEqual('TestFirstname');
          expect(data.email).toEqual('test@test.fr');
          expect(data.password).toMatch(/^\$2[ayb]\$.{56}$/);
          expect(data.wishes).toBeDefined();
        });
    });
  });

  describe('verify email', () => {
    it('should verify the user email', () => {
      return resolver.verifyEmail({
        user_id: "624af86f5998c2fdfa851b16",
        token: "xzYjBolsAUaJFnIVP1MxWWf2Plu0Ro4z"
      }).then((data) => {
        expect(data.success).toBe(true);
      });
    });
  });

  describe('update wishes', () => {
    it('should update the wishes', () => {
      return resolver.updateWishes({
        _id: "624af86f5998c2fdfa851b16",
        firstname: "Test",
        lastname: "Test",
        email: "test@test.fr",
        wishes: {}
      }, {
        burial_cremation: "TEST1",
        burial_cremation_place: "TEST2",
        music: "TEST3"
      }).then((data) => {
        expect(data.burial_cremation).toEqual('TEST1');
        expect(data.burial_cremation_place).toEqual('TEST2');
        expect(data.music).toEqual('TEST3');
      });
    })
  });

  describe('update user', () => {
    it('should update the user', () => {
      return resolver.updateUser({
        _id: "624af86f5998c2fdfa851b16",
        firstname: "Test",
        lastname: "Test",
        email: "test@test.fr",
        wishes: {}
      }, {
        firstname: "changeTest",
        lastname: "changeTest",
        password: "changeTest1234@",
        new_email: "changetest@test.fr",
      }).then((data) => {
        expect(data._id).toEqual('624af86f5998c2fdfa851b16');
        expect(data.firstname).toEqual('changeTest');
        expect(data.lastname).toEqual('changeTest');
        expect(data.email).toEqual('test@test.fr');
        expect(data.new_email).toEqual('changetest@test.fr');
        expect(data.new_email_token).toBeDefined();
      });
    });
  });

  describe('ask for a password reset', () => {
    it('should return a success', () => {
      return resolver.askResetPasswordUser({
        email: "test@test.fr"
      }).then((data) => {
        expect(data.success).toBe(true);
      });
    });
  });

  describe('reset a password', () => {
    it('should return the updated user', () => {
      return resolver.resetPasswordUser({
        user_id: "624af86f5998c2fdfa851b16",
        token: "JLmg8tfHXJOYcd7PMT6mSgNT9qczkyuh",
        new_password: "changeTest1234@"
      }).then((data) => {
        expect(data._id).toEqual('624af86f5998c2fdfa851b16');
        expect(data.firstname).toEqual('changeTest');
        expect(data.lastname).toEqual('changeTest');
        expect(data.email).toEqual('test@test.fr');
      });
    });
  });

  describe('update user\'s email', () => {
    it('should return the updated user', () => {
      return resolver.updateEmailUser({
        user_id: "624af86f5998c2fdfa851b16",
        token: "JLmg8tfHXJOYcd7PMT6mSgNT9qczkyuh",
      }).then((data) => {
        expect(data._id).toEqual('624af86f5998c2fdfa851b16');
        expect(data.firstname).toEqual('Test');
        expect(data.lastname).toEqual('Test');
        expect(data.email).toEqual('changetest@test.fr');
      });
    });
  });

});
