import * as encrypt from 'mongoose-encryption';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import mongoose from 'mongoose';

export type WishesDocument = WishesDB & Document;

@Schema({ collection: 'wishes' })
export class WishesDB {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user_id: string;

  @Prop({ type: String })
  burial_cremation?: string;

  @Prop({ type: String })
  burial_cremation_place?: string;

  @Prop({ type: String })
  music?: string;

  @Prop({ type: String })
  religion?: string;

  @Prop({ type: String })
  place?: string;

  @Prop({ type: String })
  prevoyance?: string;

  @Prop({ type: String })
  list_of_people?: string;

  @Prop({ type: String })
  coffin?: string;

  @Prop({ type: String })
  ornament?: string;

  @Prop({ type: String })
  text?: string;

  @Prop({ type: String })
  other?: string;
}

export const WishesDBSchema = SchemaFactory.createForClass(WishesDB);

// const encKey = process.env.SOME_32BYTE_BASE64_STRING;
// const sigKey = process.env.SOME_64BYTE_BASE64_STRING;

const encKey = '3QY5IYo7KirstpPSZ/aXtzEZ8q1jAAYFUEJL4g8rPO8=';
const sigKey =
  '6K6gQtuj52BGL5wuP7dSW/NSBCd/hkjIE70SBMSt+2GCgReQZMV6BxoGFq7RT8EnPmEE19TZNidEoR40dZSacw==';

WishesDBSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  excludeFromEncryption: ['user_id'],
});
// This adds _ct and _ac fields to the schema, as well as pre 'init' and pre 'save' middleware,
// and encrypt, decrypt, sign, and authenticate instance methods
