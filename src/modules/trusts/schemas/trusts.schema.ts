import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import mongoose from 'mongoose';

export enum StateTrust {
  INVITATION_SENT,
  WAITING_CONFIRMATION,
  VALIDATED,
}

export type TrustDocument = Trust & Document;

@Schema()
@ObjectType()
export class Trust {
  @Prop({ required: true, default: new Date() })
  @Field(() => Date)
  added_date?: Date;

  @Prop()
  security_code?: string;

  @Prop({ required: true, default: false })
  @Field()
  urgent_data_unlocked?: boolean;

  @Prop()
  @Field(() => Date)
  urgent_data_unlocked_date?: Date;

  @Prop({ required: true })
  @Field(() => StateTrust)
  state: StateTrust;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @Field(() => User)
  trusted_user?: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  @Field(() => User)
  legator_user?: User;
}

export const TrustSchema = SchemaFactory.createForClass(Trust);
