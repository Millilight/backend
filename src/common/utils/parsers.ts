import {
  BankProduct,
  LifeInsurance,
  ConsumerCredit,
  Heir,
  InsuranceProduct,
  InternetAccountToBeDeleted,
  Legator,
  Procedures,
  RealEstate,
  User,
  Vehicle,
  Wishes,
} from 'src/graphql';

import { BankProductDocument } from 'src/modules/procedures/schemas/bank-product.schema';
import { ConsumerCreditDocument } from 'src/modules/procedures/schemas/consumer-credit.schema';
import { InsuranceProductDocument } from 'src/modules/procedures/schemas/insurance-product.schema';
import { InternetAccountToBeDeletedDocument } from 'src/modules/procedures/schemas/internet-account-to-be-deleted.schema';
import { ProceduresDocument } from 'src/modules/procedures/schemas/procedures.schema';
import { RealEstateDocument } from 'src/modules/procedures/schemas/real-estate.schema';
import { TrustDocument } from 'src/modules/trusts/schemas/trusts.schema';
import { UserDocument } from 'src/modules/users/schemas/user.schema';
import { VehicleDocument } from 'src/modules/procedures/schemas/vehicle.schema';
import { WishesDocument } from 'src/modules/wishes/schemas/wishes.schema';
import { LifeInsuranceDocument } from 'src/modules/procedures/schemas/life-insurance.schema';

export const trustDocToHeir = (trust_doc: TrustDocument): Heir => ({
  _id: trust_doc.heir_user_id,
  user_details: undefined,
  state: trust_doc.state,
  security_code: trust_doc.security_code,
  added_date: trust_doc.added_date,
  urgent_data_unlocked: trust_doc.urgent_data_unlocked,
  urgent_data_unlocked_date: trust_doc.urgent_data_unlocked_date,
  sensitive_data_unlocked: trust_doc.sensitive_data_unlocked,
  sensitive_data_unlocked_date: trust_doc.sensitive_data_unlocked_date,
});

export const trustDocToLegator = (trust_doc: TrustDocument): Legator => ({
  _id: trust_doc.legator_user_id,
  user_details: undefined,
  state: trust_doc.state,
  added_date: trust_doc.added_date,
  urgent_data_unlocked: trust_doc.urgent_data_unlocked,
  urgent_data_unlocked_date: trust_doc.urgent_data_unlocked_date,
  urgent_data: undefined,
  sensitive_data_unlocked: trust_doc.sensitive_data_unlocked,
  sensitive_data_unlocked_date: trust_doc.sensitive_data_unlocked_date,
  sensitive_data: undefined,
});

export const trustDocToLegatorAndHeir = (trust_doc: TrustDocument) => {
  return {
    legator_user: trustDocToLegator(trust_doc),
    heir_user: trustDocToHeir(trust_doc),
  };
};

export const userDocToUser = (user_doc: UserDocument): User => ({
  _id: user_doc._id as string,
  email: user_doc.email,
  firstname: user_doc.firstname,
  lastname: user_doc.lastname,
  urgent_data: { user_id: user_doc._id as string, wishes: undefined },
  sensitive_data: { user_id: user_doc._id as string, procedures: undefined },
  heirs: undefined,
  legators: undefined,
});

export const wishesDocToWishes = (wished_doc: WishesDocument): Wishes => ({
  burial_cremation: wished_doc.burial_cremation,
  burial_cremation_place: wished_doc.burial_cremation_place,
  coffin: wished_doc.coffin,
  list_of_people: wished_doc.list_of_people,
  music: wished_doc.music,
  ornament: wished_doc.ornament,
  other: wished_doc.other,
  place: wished_doc.place,
  prevoyance: wished_doc.prevoyance,
  religion: wished_doc.religion,
  text: wished_doc.text,
});

export const proceduresDocToProcedures = (
  procedures_doc: ProceduresDocument
): Procedures => ({
  bank_products: procedures_doc.bank_products.map(bankProductDocToBankProduct),
  life_insurances: procedures_doc.life_insurances.map(
    lifeInsuranceDocToLifeInsurance
  ),
  insurance_products: procedures_doc.insurance_products.map(
    insuranceProductDocToInsuranceProduct
  ),
  vehicles: procedures_doc.vehicles.map(vehicleDocToVehicle),
  properties: procedures_doc.properties.map(realEstateDocToRealEstate),
  consumer_credits: procedures_doc.consumer_credits.map(
    consumerCreditDocToConsumerCredit
  ),
  internet_accounts_to_be_deleted:
    procedures_doc.internet_accounts_to_be_deleted.map(
      internetAccountToBeDeletedDocTointernetAccountToBeDeleted
    ),
});

export const bankProductDocToBankProduct = (
  bank_product_doc: BankProductDocument
): BankProduct => ({
  type: bank_product_doc.type,
  company: bank_product_doc.company,
  localization: bank_product_doc.localization,
});

export const lifeInsuranceDocToLifeInsurance = (
  life_insurance_doc: LifeInsuranceDocument
): LifeInsurance => ({
  company: life_insurance_doc.company,
  contract_number: life_insurance_doc.contract_number,
});

export const insuranceProductDocToInsuranceProduct = (
  insurance_product_doc: InsuranceProductDocument
): InsuranceProduct => ({
  type: insurance_product_doc.type,
  company: insurance_product_doc.company,
  localization: insurance_product_doc.localization,
});

export const vehicleDocToVehicle = (vehicle_doc: VehicleDocument): Vehicle => ({
  type: vehicle_doc.type,
  registration_number: vehicle_doc.registration_number,
});

export const realEstateDocToRealEstate = (
  real_estate_doc: RealEstateDocument
): RealEstate => ({
  type: real_estate_doc.type,
  localization: real_estate_doc.localization,
});

export const consumerCreditDocToConsumerCredit = (
  consumer_credit_doc: ConsumerCreditDocument
): ConsumerCredit => ({
  company: consumer_credit_doc.company,
  contract_number: consumer_credit_doc.contract_number,
});

export const internetAccountToBeDeletedDocTointernetAccountToBeDeleted = (
  internet_account_to_be_deleted_doc: InternetAccountToBeDeletedDocument
): InternetAccountToBeDeleted => ({
  site: internet_account_to_be_deleted_doc.site,
  username: internet_account_to_be_deleted_doc.username,
});
