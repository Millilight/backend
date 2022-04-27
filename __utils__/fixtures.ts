import { A_PROCEDURES, A_WISHES } from './consts';
import { ProceduresDB, ProceduresDocument } from 'src/modules/procedures/schemas/procedures.schema';
import { UserDB, UserDocument } from 'src/modules/users/schemas/users.schema';
import {
  WishesDB,
  WishesDocument,
} from 'src/modules/wishes/schemas/wishes.schema';

import mongoose from 'mongoose';

export class Fixtures {
  async addUser(): Promise<UserDocument> {
    const user: UserDB = {
      firstname: 'TestFirstname',
      lastname: 'TestLastname',
      email: 'test@test.fr',
      password: 'Test1234@',
      mail_verified: true,
      signup_date: new Date(), // TODO chose a date
    };
    return mongoose.models.User.create(user) as Promise<UserDocument>;
  }

  async addWishes(): Promise<WishesDocument> {
    const user_doc = await this.addUser();
    const wishes: WishesDB = {
      ...A_WISHES,
      user_id: user_doc._id as string,
    };
    return mongoose.models.Wishes.create(wishes) as Promise<WishesDocument>;
  }

  async addProcedures(): Promise<ProceduresDocument> {
    const user_doc = await this.addUser();
    const procedures: ProceduresDB = {
      ...A_PROCEDURES,
      user_id: user_doc._id as string,
    };
    return mongoose.models.Procedures.create(procedures) as Promise<ProceduresDocument>;
  }

  async addLegatorUser(): Promise<UserDocument> {
    const legator_user: UserDB = {
      firstname: 'Legator',
      lastname: 'Legator',
      email: 'legator@test.fr',
      password: 'Test1234@',
      mail_verified: true,
      signup_date: new Date(), // TODO chose a date
    };
    return mongoose.models.User.create(legator_user) as Promise<UserDocument>;
  }

  async addHeirUser(): Promise<UserDocument> {
    const heir_user: UserDB = {
      firstname: 'Heir',
      lastname: 'Heir',
      email: 'heir@test.fr',
      password: 'Test1234@',
      mail_verified: true,
      signup_date: new Date(), // TODO chose a date
    };
    return mongoose.models.User.create(heir_user) as Promise<UserDocument>;
  }
}
