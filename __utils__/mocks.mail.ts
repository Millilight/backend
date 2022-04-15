/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '@gqltypes';

export const sendUserConfirmation = jest.fn(
  async (_user: User, _token: string): Promise<void> => Promise.resolve()
);

export const sendUserEmailUpdate = jest.fn(
  async (
    _new_user: User,
    _new_email: string,
    _new_email_token: string
  ): Promise<void> => Promise.resolve()
);

export const resetPassword = jest.fn(
  async (_new_user: User, _token: string): Promise<void> => Promise.resolve()
);
