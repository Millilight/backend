import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";

export type RealEstateDocument = RealEstate & Document;

@Schema()
export class RealEstate {    
    @Prop()
    type: string;

    @Prop()
    localization: string;
}

export const RealEstateSchema = SchemaFactory.createForClass(RealEstate);