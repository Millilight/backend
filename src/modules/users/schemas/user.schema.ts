import * as bcrypt from 'bcrypt';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { WishesDB, WishesDBSchema } from './wishes.schema';

import { Document } from 'mongoose';
import generateToken from '@/utils/generateToken';

export type UserDocument = UserDB & Document;

@Schema({ collection: 'users' })
export class UserDB {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, select: false })
  signup_mail_token: string;

  @Prop({ required: true, select: false, default: false })
  mail_verified: boolean;

  @Prop({ required: true, select: false, default: new Date() })
  signup_date: Date;

  @Prop({ select: false })
  reset_password_token?: string;

  @Prop({ select: false })
  new_email?: string;

  @Prop({ select: false })
  new_email_token?: string;

  @Prop({ select: false })
  new_email_token_verified?: boolean;

  @Prop({ type: WishesDBSchema, ref: 'wishes', default: {} })
  wishes: WishesDB;
}

export const UserDBSchema = SchemaFactory.createForClass(UserDB);

UserDBSchema.pre('findOneAndUpdate', function (next) {
  const user_doc = this as any;

  if (user_doc._update.$set == undefined) return next();

  if (user_doc._update.$set.new_email != null) {
    user_doc._update.$set.new_email_token = generateToken(32);
    user_doc._update.$set.new_email_token_verified = false;
  }

  if (user_doc._update.$set.password != null)
    user_doc._update.$set.password = bcrypt.hashSync(
      user_doc._update.$set.password,
      10
    );

  next();
});

UserDBSchema.pre('save', function (next) {
  const userDB = this as UserDocument;

  if (this.isModified('password') || this.isNew)
    userDB.password = bcrypt.hashSync(userDB.password, 10);
  next();
});
