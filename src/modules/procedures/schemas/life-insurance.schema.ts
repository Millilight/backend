import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type LifeInsuranceDocument = LifeInsurance & Document;

@Schema()
export class LifeInsurance {
  @Prop()
  company: string;

  @Prop()
  contract_number: string;
}

export const LifeInsuranceSchema = SchemaFactory.createForClass(LifeInsurance);
