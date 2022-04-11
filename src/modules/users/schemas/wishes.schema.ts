import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type WishesDocument = WishesDB & Document;

@Schema({ collection: 'wishes' })
export class WishesDB {
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
