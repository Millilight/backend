import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Wishes, WishesSchema } from './wishes.schema';

export type UserDocument = UserDB & Document;
@Schema()
@ObjectType()
class UserBase {
  // This class contains all the fiedls that are both in user db schema and user gql schema

  @Prop({ type: MongooseSchema.Types.ObjectId })
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

  @Prop({ type: WishesSchema, ref: 'Wishes' })
  @Field(() => Wishes, { nullable: true })
  wishes?: Wishes;
}

@ObjectType()
export class User extends UserBase {
  // This call contains all the fields only available in the grapql schema
}

@Schema()
export class UserDB extends UserBase {
  // This call contains all the fields only available in the db schema
  @Prop({ required: true, select: false })
  encrypted_password: string;
}

export const UserSchema = SchemaFactory.createForClass(UserDB);

UserSchema.pre('save', function (next) {
  const user = this as UserDocument;

  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(user.encrypted_password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }

          user.encrypted_password = hash;
          next();
        });
      }
    });
  } else {
    return next();
  }
});
