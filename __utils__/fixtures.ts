import { UserDB } from "../src/modules/users/schemas/user.schema";
import mongoose from "mongoose";

export class Fixtures {
    async addUser() {
        const user: UserDB = {
            firstname: 'TestFirstname',
            lastname: "TestLastname",
            email: 'test@test.fr',
            password: 'Test1234@',
            signup_mail_token: 'JLmg8tfHXJOYcd7PMT6mSgNT9qczkyuh',
            wishes: {},
            mail_verified: true,
            signup_date: new Date() // TODO chose a date
        }
        await mongoose.models.UserDB.create(user);
    };
}