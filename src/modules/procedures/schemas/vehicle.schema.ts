import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";

export type VehicleDocument = Vehicle & Document;

@Schema()
export class Vehicle {
    @Prop()
    type: string;

    @Prop()
    registration_number: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);