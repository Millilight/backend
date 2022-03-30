import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDB, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userBD: UserDB = {
      firstname: createUserDto.firstname,
      lastname: createUserDto.lastname,
      email: createUserDto.email,
      encrypted_password: createUserDto.password,
    };
    const createdUser = new this.userModel(userBD);
    return createdUser.save().then(userDocToUser);
    // throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    // TODO Throw errors, intercept it and respond properly
  }

  async getWithAuth(email: string, password: string): Promise<User> {
    return this.userModel
      .findOne({ email: email })
      .select('+encrypted_password')
      .exec()
      .then((user) => {
        if (bcrypt.compareSync(password, user.encrypted_password)) {
          return userDocToUser(user);
        } else return null;
      });
  }

  async findByID(user_id: string): Promise<User> {
    return this.userModel.findOne({ id: user_id }).exec().then(userDocToUser);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec().then(userDocsToUsers);
  }
}
const userDocsToUsers = (userDocs: UserDocument[]): User[] => {
  return userDocs.map(userDocToUser);
};

const userDocToUser = (userDoc: UserDocument): User => {
  const user: User = {
    id: userDoc._id,
    lastname: userDoc.lastname,
    firstname: userDoc.firstname,
    email: userDoc.email,
  };
  return user;
};
