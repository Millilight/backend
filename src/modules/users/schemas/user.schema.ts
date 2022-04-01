import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Wishes, WishesSchema } from './wishes.schema';

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

  @Prop({ type: WishesSchema, ref: 'Wishes', default: {} })
  @Field(() => Wishes)
  wishes: Wishes;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('findOneAndUpdate', function (next) {
  const user = this as any;

  if (user._update.$set.password == null) {
    return next();
  }

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
