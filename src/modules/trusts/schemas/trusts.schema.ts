import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import mongoose from 'mongoose';

export type TrustDocument = Trust & Document;

@Schema()
@ObjectType()
export class Trust {
  @Field(() => ID)
  _id?: string;

  @Field()
  email?: string;

  @Field()
  firstname?: string;

  @Field()
  lastname?: string;

  @Prop({ required: true, default: new Date() })
  @Field(() => Date)
  added_date: Date;

  @Prop()
  @Field({ nullable: true })
  security_code?: string;

  @Prop({ required: true, default: false })
  urgent_data_unlocked: boolean;

  @Prop()
  urgent_data_unlocked_date?: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @Field(() => User)
  trustedUser?: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @Field(() => User)
  legatorUser: User;
}

export const UserSchema = SchemaFactory.createForClass(Trust);
