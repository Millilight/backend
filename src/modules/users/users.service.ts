import { Model } from 'mongoose';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import convertToDotNotation from '@/utils/convertToDotNotation';
import { MongoError } from 'mongodb';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private mailService: MailService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const signup_mail_token = Math.floor(1000 + Math.random() * 90000000000000000000).toString();
    
    const user = await this.userModel
      .create({...createUserDto, signup_mail_token: signup_mail_token})
      .catch((exception: MongoError) => {
        if (exception.code == 11000) {
          throw new ConflictException('This email is already registered');
        }
        throw exception;
      });
      
      await this.mailService.sendUserConfirmation(user, signup_mail_token);
      
      return user;
  }

  async getWithAuth(email: string, password: string): Promise<User> {
    return await this.userModel
      .findOne({ email: email })
      .select('+password')
      .exec()
      .then((user) => {
        if (bcrypt.compareSync(password, user.password)) {
          return user;
        } else return null;
      });
  }

  async findByID(user_id: string): Promise<User> {
    return await this.userModel.findOne({ _id: user_id }).exec().then();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec().then();
  }

  async updateUser(user: User, user_update: any): Promise<User> {
    return await this.userModel
      .findOneAndUpdate(
        { _id: user._id },
        { $set: convertToDotNotation(user_update) },
        { new: true, omitUndefined: true }
      )
      .exec();
  }
}
