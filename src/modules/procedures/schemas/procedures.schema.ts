import * as encrypt from 'mongoose-encryption';

import { BankProduct, ConsumerCredit, InsuranceProduct, InternetAccountToBeDeleted, RealEstate, Vehicle } from '@gqltypes';
import { BankProductDocument, BankProductSchema } from './bank-product.schema';
import { ConsumerCreditDocument, ConsumerCreditSchema } from './consumer-credit.schema';
import { InsuranceProductDocument, InsuranceProductSchema } from './insurance-product.schema';
import { InternetAccountToBeDeletedDocument, InternetAccountToBeDeletedSchema } from './internet-account-to-be-deleted.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RealEstateDocument, RealEstateSchema } from './real-estate.schema';
import { VehicleDocument, VehicleSchema } from './vehicle.schema';

import { Document } from 'mongoose';
import mongoose from 'mongoose';

export type ProceduresDocument = ProceduresDB & Document;

@Schema({ collection: 'procedures' })
export class ProceduresDB {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user_id: string;

  @Prop({ type: [BankProductSchema], ref: 'BankProducts', default: [], required: true })
  bank_products: BankProduct[];

  @Prop({ type: [InsuranceProductSchema], ref: 'InsuranceProducts', default: [], required: true })
  insurance_products: InsuranceProduct[];

  @Prop({ type: [VehicleSchema], ref: 'Vehicles', default: [], required: true })
  vehicles: Vehicle[];

  @Prop({ type: [RealEstateSchema], ref: 'Properties', default: [], required: true })
  properties: RealEstate[];

  @Prop({ type: [ConsumerCreditSchema], ref: 'ConsumerCredits', default: [], required: true })
  consumer_credits: ConsumerCredit[];

  @Prop({ type: [InternetAccountToBeDeletedSchema], ref: 'InternetAccountsToBeDeleted', default: [], required: true })
  internet_accounts_to_be_deleted: InternetAccountToBeDeleted[];
}

export const ProceduresDBSchema = SchemaFactory.createForClass(ProceduresDB);

// const encKey = process.env.SOME_32BYTE_BASE64_STRING;
// const sigKey = process.env.SOME_64BYTE_BASE64_STRING;

const encKey = '3QY5IYo7KirstpPSZ/aXtzEZ8q1jAAYFUEJL4g8rPO8=';
const sigKey =
  '6K6gQtuj52BGL5wuP7dSW/NSBCd/hkjIE70SBMSt+2GCgReQZMV6BxoGFq7RT8EnPmEE19TZNidEoR40dZSacw==';

ProceduresDBSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  excludeFromEncryption: ['user_id'],
});
// This adds _ct and _ac fields to the schema, as well as pre 'init' and pre 'save' middleware,
// and encrypt, decrypt, sign, and authenticate instance methods
