import { User, UserSchema } from "../../modules/users/schemas/user.schema";

import mongoose from "mongoose";

export class Fixtures {
    async addUser() {
        const user: User = {
            firstname: 'TestFirstname',
            lastname: "TestLastname",
            email: 'test@test.fr',
            password: 'Test1234@',
            signup_mail_token: 'JLmg8tfHXJOYcd7PMT6mSgNT9qczkyuh',
            wishes: {}
        }
        await mongoose.models.User.create(user);
    };
}