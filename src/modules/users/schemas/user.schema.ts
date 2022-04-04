import * as bcrypt from 'bcrypt';

import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Wishes, WishesSchema } from './wishes.schema';

import { Document } from 'mongoose';
import { UnauthorizedException } from '@nestjs/common';
import generateToken from '@/utils/generateToken';

export type UserDocument = User & Document;
@Schema()
@ObjectType()
export class User {
  @Field(() => ID)
  _id?: string;

  @Prop({ required: true })
  @Field(() => String)
  firstname: string;

  @Prop({ required: true })
  @Field(() => String)
  lastname: string;

  @Prop({
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  })
  @Field(() => String)
  email: string;

  @Prop({ required: true, select: false })
  password?: string;

  @Prop({ required: true, select: false })
  signup_mail_token?: String;

  @Prop({ required: true, select: false, default: false })
  mail_verified?: Boolean;

  @Prop({ required: true, select: false, default: new Date() })
  signup_date?: Date;

  @Prop({ select: false })
  reset_password_token?: String;

  @Prop({ select: false })
  new_email?: String;

  @Prop({ select: false })
  new_email_token?: String;

  @Prop({ select: false })
  new_email_token_verified?: Boolean;

  @Prop({ type: WishesSchema, ref: 'Wishes', default: {} })
  @Field(() => Wishes)
  wishes: Wishes;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('findOneAndUpdate', function (next) {
  const user = this as any;

  if (user._update.$set == undefined) {
    return next();
  }

  if(user._update.$set.new_email != null){
    user._update.$set.new_email_token = generateToken(32);
    user._update.$set.new_email_token_verified = false;
    next();
  }

  if(user._update.$set.password != null){
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user._update.$set.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }
          user._update.$set.password = hash;
          next();
        });
      }
    });
  }
  next();
});

UserSchema.pre('save', function (next) {
  const user = this as UserDocument;

  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }

          user.password = hash;
          
          next();
        });
      }
    });
  } else {
    return next();
  }
});
