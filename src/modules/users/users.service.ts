import { Model } from 'mongoose';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { MongoError } from 'mongodb';
import generateToken from '@/utils/generateToken';
import { User, UserDetails } from '@gqltypes';
import { UserDocument } from './schemas/users.schema';
import { userDocToUser } from '@parsers';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AskResetPasswordUserDto } from './dto/ask-reset-password-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordUserDto } from './dto/reset-password-user.dto';
import { VerifyNewEmailDto } from './dto/verify-new-email.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {}

  async create(create_user_dto: CreateUserDto): Promise<User> {
    const signup_mail_token = generateToken(32);

    return await this.userModel
      .create({ ...create_user_dto, signup_mail_token: signup_mail_token })
      .then((user_doc) => {
        user_doc.signup_mail_token = signup_mail_token;
        return userDocToUser(user_doc);
      })
      .catch((exception: MongoError) => {
        if (exception.code == 11000) {
          throw new ConflictException('Email already registered');
        }
        throw exception;
      });
  }

  async getWithAuth(email: string, password: string): Promise<User> {
    return await this.userModel
      .findOne({ email: email })
      .select('+password +mail_verified')
      .exec()
      .then((user_doc) => {
        if (!user_doc || !bcrypt.compareSync(password, user_doc.password))
          throw new NotFoundException('User not found');
        if(!user_doc.mail_verified)
          throw new UnauthorizedException('Mail not verified');
        return userDocToUser(user_doc);
      });
  }

  async findByID(user_id: string): Promise<User> {
    return await this.userModel
      .findOne({ _id: user_id })
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        return userDocToUser(user_doc);
      });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userModel
      .findOne({ email: email })
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        return userDocToUser(user_doc);
      });
  }

  async getNewEmailAndToken(
    user_id: string
  ): Promise<{ new_email: string; new_email_token: string }> {
    return this.userModel
      .findOne({ _id: user_id })
      .select('+new_email +new_email_token')
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        if (!user_doc.new_email || !user_doc.new_email_token)
          throw new ConflictException("User didn't ask for an email change");
        return {
          new_email: user_doc.new_email,
          new_email_token: user_doc.new_email_token,
        };
      });
  }

  async getSignupMailToken(user_id: string): Promise<string> {
    return await this.userModel
      .findOne({ _id: user_id })
      .select('+signup_mail_token +mail_verified')
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        if (user_doc.mail_verified)
          throw new ConflictException('Email already verified');
        return user_doc.signup_mail_token;
      });
  }

  async update(user: User, update_user_dto: UpdateUserDto): Promise<User> {
    const user_doc = await this.userModel.findOne({ _id: user._id });
    if (!user_doc) throw new NotFoundException('User not found');

    // Update all the fields
    Object.getOwnPropertyNames(update_user_dto).forEach((field) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user_doc[field] = update_user_dto[field];
    });

    // Delete the reset password token if a new password is set
    if (update_user_dto.password) user_doc.reset_password_token = undefined;

    // Add a token to verify the new email
    if (update_user_dto.new_email) user_doc.new_email_token = generateToken(32);

    return user_doc.save().then(userDocToUser);
  }

  async verifyNewEmail(verify_new_email_dto: VerifyNewEmailDto): Promise<User> {
    const user_doc = await this.userModel
      .findOne({ _id: verify_new_email_dto.user_id })
      .select('+new_email +new_email_token')
      .exec();

    if (!user_doc) throw new NotFoundException('User not found');

    if (user_doc.new_email_token !== verify_new_email_dto.token)
      throw new ConflictException('Wrong token');

    user_doc.email = user_doc.new_email;
    user_doc.new_email = undefined;
    user_doc.new_email_token = undefined;

    return user_doc.save().then(userDocToUser);
  }

  async verifyEmail(verify_email_dto: VerifyEmailDto): Promise<User> {
    const user_doc = await this.userModel
      .findOne({ _id: verify_email_dto.user_id })
      .select('+signup_mail_token +mail_verified')
      .exec();

    if (!user_doc) throw new NotFoundException('User not found');

    if (user_doc.mail_verified)
      throw new ConflictException('Email already verified');

    if (user_doc.signup_mail_token !== verify_email_dto.token)
      throw new UnauthorizedException('Wrong token.');

    user_doc.signup_mail_token = undefined;
    user_doc.mail_verified = true;

    return user_doc.save().then(userDocToUser);
  }

  async askResetPassword(
    ask_reset_password_user_dto: AskResetPasswordUserDto
  ): Promise<{ user: User; reset_password_token: string }> {
    const user_doc = await this.userModel
      .findOne({ email: ask_reset_password_user_dto.email })
      .exec();

    if (!user_doc) throw new NotFoundException('User not found');

    const reset_password_token = generateToken(32);
    user_doc.reset_password_token = reset_password_token;

    return {
      user: await user_doc.save().then(userDocToUser),
      reset_password_token: reset_password_token,
    };
  }

  async verifyTokenAndResetPassword(
    reset_password_user_dto: ResetPasswordUserDto
  ): Promise<User> {
    const user_doc = await this.userModel
      .findOne({ _id: reset_password_user_dto.user_id })
      .select('+reset_password_token')
      .exec();
    if (!user_doc) throw new NotFoundException('User not found');
    if (user_doc.reset_password_token !== reset_password_user_dto.token)
      throw new ConflictException('Wrong token');
    user_doc.password = reset_password_user_dto.new_password;
    user_doc.reset_password_token = undefined;
    return user_doc.save().then(userDocToUser);
  }

  async userDetailsByID(user_id: string): Promise<UserDetails> {
    return await this.userModel
      .findOne({ _id: user_id })
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        return {
          email: user_doc.email,
          firstname: user_doc.firstname,
          lastname: user_doc.lastname,
        };
      });
  }
}
