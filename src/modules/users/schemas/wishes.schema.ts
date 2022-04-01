import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type WishesDocument = Wishes & Document;

@Schema()
@ObjectType()
export class Wishes {
  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  burial_cremation?: string;

  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  burial_cremation_place?: string;

  @Prop({ type: String })
  @Field(() => String, { nullable: true })
  music?: string;
}

export const WishesSchema = SchemaFactory.createForClass(Wishes);
