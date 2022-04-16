/* eslint-disable @typescript-eslint/no-unused-vars */
import { User, Wishes } from '@gqltypes';

import { A_WISHES } from './consts';
import { UpdateWishesDto } from 'src/modules/wishes/dto/update-wishes.dto';

export const findByUserID = jest.fn(
  async (_user_id: string): Promise<Wishes> => Promise.resolve(A_WISHES)
);

export const update = jest.fn(
  async (_user: User, update_wishes_dto: UpdateWishesDto): Promise<Wishes> =>
    Promise.resolve({ ...A_WISHES, ...update_wishes_dto })
);
