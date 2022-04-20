import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";

export type BankProductDocument = BankProduct & Document;

@Schema()
export class BankProduct {
    @Prop()
    type: string;

    @Prop()
    company: string;

    @Prop()
    localization: string;
}

export const BankProductSchema = SchemaFactory.createForClass(BankProduct);