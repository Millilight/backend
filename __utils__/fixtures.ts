import { UserDB, UserDocument } from 'src/modules/users/schemas/user.schema';

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
    return mongoose.models.UserDB.create(user) as Promise<UserDocument>;
  }
}
