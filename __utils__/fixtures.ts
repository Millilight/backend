import { A_TOKEN, A_WISHES } from './consts';
import { UserDB, UserDocument } from 'src/modules/users/schemas/user.schema';
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
}
