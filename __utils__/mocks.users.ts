import { AN_USER, A_TOKEN } from './consts';

import { AskResetPasswordUserDto } from 'src/modules/users/dto/ask-reset-password-user.dto';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { User } from '@gqltypes';
import { VerifyEmailDto } from 'src/modules/users/dto/verify-email.dto';

/* eslint-disable @typescript-eslint/no-unused-vars */

export const create = jest.fn(async (user: CreateUserDto): Promise<User> => {
  const res = { ...AN_USER, ...user };
  delete res.password;
  return Promise.resolve(res);
});

export const getSignupMailToken = jest.fn(
  async (_id: string): Promise<string> => Promise.resolve(A_TOKEN)
);

export const verifyEmail = jest.fn(
  async (_verify_email_dto: VerifyEmailDto): Promise<{ success: boolean }> =>
    Promise.resolve({ success: true })
);

export const getWithAuth = jest.fn(
  async (_email: string, _password: string): Promise<User> =>
    Promise.resolve(AN_USER)
);

export const update = jest.fn(
  async (user: User, user_update: UpdateUserDto): Promise<User> => {
    const res = { ...user, ...user_update };
    delete res.password;
    delete res.new_email;
    return Promise.resolve(res);
  }
);

export const getNewEmailAndToken = jest.fn(
  async (
    _id: string
  ): Promise<{ new_email: string; new_email_token: string }> =>
    Promise.resolve({
      new_email: 'new_email',
      new_email_token: A_TOKEN,
    })
);

export const askResetPassword = jest.fn(
  async (
    _dto: AskResetPasswordUserDto
  ): Promise<{
    user: User;
    reset_password_token: string;
  }> =>
    Promise.resolve({
      user: AN_USER,
      reset_password_token: A_TOKEN,
    })
);

export const verifyTokenAndResetPassword = jest.fn(
  async (_dto: VerifyEmailDto): Promise<User> => Promise.resolve(AN_USER)
);

export const verifyNewEmail = jest.fn(
  async (_user: User, _token: string): Promise<User> => Promise.resolve(AN_USER)
);

export const findByID = jest.fn(
  async (_user_id: string): Promise<User> => Promise.resolve(AN_USER)
);
