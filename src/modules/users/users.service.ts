import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import convertToDotNotation from '@/utils/convertToDotNotation';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userBD: User = {
      firstname: createUserDto.firstname,
      lastname: createUserDto.lastname,
      email: createUserDto.email,
      encrypted_password: createUserDto.password,
    };
    return this.userModel.create(userBD);
    //return createdUser.save().then();
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
          return user;
        } else return null;
      });
  }

  async findByID(user_id: string): Promise<User> {
    return this.userModel.findOne({ _id: user_id }).exec().then();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec().then();
  }

  async updateUser(user: User, user_update: any): Promise<User> {
    return this.userModel
      .findOneAndUpdate(
        { _id: user._id },
        { $set: convertToDotNotation(user_update) },
        { new: true, omitUndefined: true }
      )
      .exec();
  }
}
