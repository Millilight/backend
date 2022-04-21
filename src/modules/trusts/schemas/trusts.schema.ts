import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';
import { StateTrust } from '@gqltypes';
import mongoose from 'mongoose';

export type TrustDocument = TrustDB & Document;

@Schema({ collection: 'trusts' })
export class TrustDB {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  heir_user_id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  legator_user_id: string;

  @Prop({ required: true })
  state: StateTrust;

  @Prop({ required: true, default: new Date() })
  added_date: Date;

  @Prop()
  security_code?: string;

  @Prop({ required: true, default: false })
  urgent_data_unlocked: boolean;

  @Prop()
  urgent_data_unlocked_date?: Date;

  @Prop({ required: true, default: false })
  sensitive_data_unlocked: boolean;

  @Prop()
  sensitive_data_unlocked_date?: Date;
}

export const TrustDBSchema = SchemaFactory.createForClass(TrustDB);
