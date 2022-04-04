import { Model } from 'mongoose';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import convertToDotNotation from '@/utils/convertToDotNotation';
import { MongoError } from 'mongodb';
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from '../auth/verify-email.dto';
import { VerifyEmailResponse } from '../auth/verify-email-response.dto';
import generateToken from '@/utils/generateToken';
import { AskResetPasswordUserDto } from './dto/ask-reset-password-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, private mailService: MailService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const signup_mail_token = generateToken(32);
    
    return await this.userModel
      .create({...createUserDto, signup_mail_token: signup_mail_token})
      .then((user) => {
        user.signup_mail_token = signup_mail_token;
        return user;
      })
      .catch((exception: MongoError) => {
        if (exception.code == 11000) {
          throw new ConflictException('This email is already registered');
        }
        throw exception;
      });
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
    return await this.userModel.findOne({ _id: user_id }).exec();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async updateUser(user: User, user_update: any): Promise<User> {
    return await this.userModel
      .findOneAndUpdate(
        { _id: user._id },
        { $set: convertToDotNotation(user_update) },
        { new: true, omitUndefined: true }
      )
      .exec()
      .then((user) => {
        if(!user) throw new InternalServerErrorException("The user could not be updated.");

        return user;
      });
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) : Promise<VerifyEmailResponse> {
    return await this.userModel
      .findOne({ _id: verifyEmailDto.user_id})
      .select("signup_mail_token mail_verified")
      .then((user) => {

        if(!user) throw new NotFoundException("Unable to find user");

        if (user.signup_mail_token !== verifyEmailDto.token) return {success : false};

        if(user.mail_verified) throw new ConflictException('This mail has already been verified');
        
        user.mail_verified = true;
        
        user.save();
        
        return {
          success: true
        };
    });
  }

  async askResetPassword(askResetPasswordUserDto: AskResetPasswordUserDto) : Promise<User> {
    return await this.userModel
      .findOneAndUpdate({ email : askResetPasswordUserDto.email}, { reset_password_token: generateToken(32)}, {new: true, omitUndefined: true})
      .select("+reset_password_token -wishes")
      .exec()
      .then((user: User) => {
        if(!user) throw new NotFoundException("The user could not be found.");
        return user;
      });
  }

  async checkResetPassword(user_id: string, token : string) : Promise<User> {
    return await this.userModel
      .findOne({ _id : user_id, reset_password_token: token})
      .select("-wishes")
      .exec()
      .then((user) => {
        if(!user) throw new NotFoundException("The user did not ask for a password change or he could not be found.");
        return user;
      });
  }
}
