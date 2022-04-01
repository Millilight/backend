import { Model } from 'mongoose';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import convertToDotNotation from '@/utils/convertToDotNotation';
import { MongoError } from 'mongodb';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from '../auth/verify-email.dto';
import { VerifyEmailResponse } from '../auth/verify-email-response.dto';
import { NotFoundError } from 'rxjs';

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

  async verifyEmail(verifyEmailDto: VerifyEmailDto) : Promise<VerifyEmailResponse> {
    return await this.userModel
      .findOne({ _id: verifyEmailDto.user_id})
      .select("signup_mail_token mail_verified")
      .then((user) => {

        if(!user) throw new Error("Unable to find user");

        if (user.signup_mail_token !== verifyEmailDto.token) return {success : false};

        if(user.mail_verified) throw new NotFoundException('This mail has already been verified');
        
        user.mail_verified = true;
        
        user.save();
        
        return {
          success: true
        };
    });
  }
}
