import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";

export type ConsumerCreditDocument = ConsumerCredit & Document;

@Schema()
export class ConsumerCredit {    
    @Prop()
    company: string;

    @Prop()
    contract_number: string;
}

export const ConsumerCreditSchema = SchemaFactory.createForClass(ConsumerCredit);