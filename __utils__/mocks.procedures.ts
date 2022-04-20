/* eslint-disable @typescript-eslint/no-unused-vars */
import { Procedures, User } from '@gqltypes';

import { A_PROCEDURES } from './consts';
import { UpdateProceduresDto } from 'src/modules/procedures/dto/update-procedures.dto';

export const findByUserID = jest.fn(
  async (_user_id: string): Promise<Procedures> => Promise.resolve(A_PROCEDURES)
);

export const update = jest.fn(
  async (_user: User, update_procedures_dto: UpdateProceduresDto): Promise<Procedures> =>
    Promise.resolve({ ...A_PROCEDURES, ...update_procedures_dto })
);
