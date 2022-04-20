import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";

export type InsuranceProductDocument = InsuranceProduct & Document;

@Schema()
export class InsuranceProduct {
    @Prop()
    type: string;

    @Prop()
    company: string;

    @Prop()
    localization: string;
}

export const InsuranceProductSchema = SchemaFactory.createForClass(InsuranceProduct);