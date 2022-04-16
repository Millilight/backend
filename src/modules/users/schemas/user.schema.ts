import * as bcrypt from 'bcrypt';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

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

  @Prop({ select: false })
  signup_mail_token?: string;

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
}

export const UserDBSchema = SchemaFactory.createForClass(UserDB);

UserDBSchema.pre('save', function (next) {
  const userDB = this as UserDocument;

  // Encrypt the password if modified
  if (this.isModified('password') || this.isNew)
    userDB.password = bcrypt.hashSync(userDB.password, 10);
  next();
});
