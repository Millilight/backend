import { Model } from 'mongoose';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import convertToDotNotation from '@/utils/convertToDotNotation';
import { MongoError } from 'mongodb';
import generateToken from '@/utils/generateToken';
import {
  AskResetPasswordUserDto,
  CreateUserDto,
  UrgentData,
  User,
  UserDetails,
  VerifyEmailDto,
  VerifyEmailResponse,
} from '@gqltypes';
import { UserDocument } from './schemas/user.schema';
import { userDocToUser } from '@parsers';

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
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        if (bcrypt.compareSync(password, user_doc.password))
          return userDocToUser(user_doc);
        else return null;
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
    return await this.userModel.findOne({ email: email }).exec().then(userDocToUser); // Only used to check if an user already has an account so as to add him as a truster_user. There is no NotFoundException then.
  }

  async getNewEmail(user_id: string): Promise<string> {
    return await this.userModel
      .findOne({ _id: user_id })
      .select('+new_email')
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        return user_doc.new_email;
      });
  }

  async getNewEmailToken(user_id: string): Promise<string> {
    return await this.userModel
      .findOne({ _id: user_id })
      .select('+new_email_token')
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        return user_doc.new_email_token;
      });
  }

  async getSignupMailToken(user_id: string): Promise<string> {
    return await this.userModel
      .findOne({ _id: user_id })
      .select('+signup_mail_token')
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        return user_doc.signup_mail_token;
      });
  }

  async getResetPasswordToken(user_id: string): Promise<string> {
    return await this.userModel
      .findOne({ _id: user_id })
      .select('+reset_password_token')
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        return user_doc.reset_password_token;
      });
  }

  async findByIDAndNewMailTokenWithNewEMailAndNewEmailToken(
    user_id: string,
    token: string
  ): Promise<User> {
    return await this.userModel
      .findOne({ _id: user_id, new_email_token: token })
      .select('+new_email +new_email_token')
      .exec()
      .then(userDocToUser);
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec().then(user_docs=>user_docs.map(userDocToUser));
  }

  async updateUser(user: User, user_update: any): Promise<User> {
    return await this.userModel
      .findOneAndUpdate(
        { _id: user._id },
        {
          $set: convertToDotNotation(user_update),
          $unset: {
            reset_password_token: user_update.new_password ? '' : null,
          },
        },
        { new: true, omitUndefined: true }
      )
      .exec()
      .then((user_doc) => {
        if (!user_doc)
          throw new NotFoundException('The user could not be updated.');
          
        return userDocToUser(user_doc);
      });
  }

  async updateEmailUser(user: User): Promise<User> {
    const user_doc = await this.userModel.findOne({ _id: user._id });
    if (!user_doc)
      throw new NotFoundException('The user could not be updated.');
    user_doc.email = user_doc.new_email;
    user_doc.new_email = '';
    user_doc.new_email_token = '';
    user_doc.new_email_token_verified = false;
    return user_doc.save().then(userDocToUser);
  }

  async verifyEmail(
    verify_email_dto: VerifyEmailDto
  ): Promise<User> {
    return await this.userModel
      .findOne({ _id: verify_email_dto.user_id })
      .select('signup_mail_token mail_verified')
      .then(async (user_doc) => {
        if (!user_doc) throw new NotFoundException('Unable to find user');

        if (user_doc.signup_mail_token !== verify_email_dto.token)
          throw new UnauthorizedException('Wrong token.');

        if (verify_email_dto.password)
          user_doc.password = verify_email_dto.password;

        if (user_doc.mail_verified)
          throw new ConflictException('This mail has already been verified');

        user_doc.mail_verified = true;

        await user_doc.save();

        return userDocToUser(user_doc);
      });
  }

  async askResetPassword(
    ask_reset_password_user_dto: AskResetPasswordUserDto
  ): Promise<User> {
    return await this.userModel
      .findOneAndUpdate(
        { email: ask_reset_password_user_dto.email },
        { reset_password_token: generateToken(32) },
        { new: true, omitUndefined: true }
      )
      .select('+reset_password_token -wishes')
      .exec()
      .then((user_doc) => {
        if (!user_doc)
          throw new NotFoundException('The user could not be found.');
        return userDocToUser(user_doc);
      });
  }

  async checkResetPassword(user_id: string, token: string): Promise<User> {
    return await this.userModel
      .findOne({ _id: user_id, reset_password_token: token })
      .select('-wishes') //TODO pas viable par la suite car si on veut ajouter une autre categorie, il faut chercher partout
      .exec()
      .then((user_doc) => {
        if (!user_doc)
          throw new NotFoundException(
            'The user did not ask for a password change or he could not be found.'
          );
        return userDocToUser(user_doc);
      });
  }

  async getUrgentData(user_id: string): Promise<UrgentData> {
    return await this.userModel
      .findOne({ _id: user_id })
      .exec()
      .then((user_doc) => {
        if (!user_doc) throw new NotFoundException('User not found');
        return {wishes: user_doc.wishes};
      });
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
          lastname: user_doc.lastname
        };
      });
  }
}
