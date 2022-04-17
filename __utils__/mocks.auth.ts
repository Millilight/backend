import { AN_USER, A_JWT } from './consts';
import { LoginResponse, User } from '@gqltypes';

/* eslint-disable @typescript-eslint/no-unused-vars */

export const login = jest.fn(
  (_user: User): LoginResponse => ({ access_token: A_JWT, user: AN_USER })
);

export const sign = jest.fn((_: object): string => A_JWT);
