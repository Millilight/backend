import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Document } from "mongoose";

export type InternetAccountToBeDeletedDocument = InternetAccountToBeDeleted & Document;

@Schema()
export class InternetAccountToBeDeleted {
    @Prop()
    site: string;

    @Prop()
    username: string;
}

export const InternetAccountToBeDeletedSchema = SchemaFactory.createForClass(InternetAccountToBeDeleted);