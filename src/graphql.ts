
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum StateTrust {
    INVITATION_SENT = "INVITATION_SENT",
    VALIDATED = "VALIDATED"
}

export class LoginUserInput {
    email: string;
    password: string;
}

export class BankProductInput {
    type: string;
    company: string;
    localization: string;
}

export class InsuranceProductInput {
    type: string;
    company: string;
    localization: string;
}

export class VehicleInput {
    type: string;
    registration_number: string;
}

export class RealEstateInput {
    type: string;
    localization: string;
}

export class ConsumerCreditInput {
    company: string;
    contract_number: string;
}

export class InternetAccountToBeDeletedInput {
    site: string;
    username: string;
}

export class UpdateProceduresInput {
    bank_products?: Nullable<BankProductInput[]>;
    insurance_products?: Nullable<InsuranceProductInput[]>;
    vehicles?: Nullable<VehicleInput[]>;
    properties?: Nullable<RealEstateInput[]>;
    consumer_credits?: Nullable<ConsumerCreditInput[]>;
    internet_accounts_to_be_deleted?: Nullable<InternetAccountToBeDeletedInput[]>;
}

export class AddHeirInput {
    firstname: string;
    lastname: string;
    email: string;
}

export class ConfirmSecurityCodeInput {
    legator_user_id: string;
    security_code: string;
}

export class UnlockUrgentDataInput {
    legator_user_id: string;
}

export class VerifyEmailWithInvitationInput {
    user_id: string;
    token: string;
    password: string;
}

export class AskResetPasswordUserInput {
    email: string;
}

export class CreateUserInput {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
}

export class ResetPasswordUserInput {
    new_password: string;
    token: string;
    user_id: string;
}

export class VerifyNewEmailInput {
    token: string;
    user_id: string;
}

export class UpdateUserInput {
    firstname?: Nullable<string>;
    lastname?: Nullable<string>;
    new_email?: Nullable<string>;
    password?: Nullable<string>;
}

export class UpdateWishesInput {
    burial_cremation?: Nullable<string>;
    burial_cremation_place?: Nullable<string>;
    music?: Nullable<string>;
    religion?: Nullable<string>;
    place?: Nullable<string>;
    prevoyance?: Nullable<string>;
    list_of_people?: Nullable<string>;
    coffin?: Nullable<string>;
    ornament?: Nullable<string>;
    text?: Nullable<string>;
    other?: Nullable<string>;
}

export class VerifyEmailInput {
    token: string;
    user_id: string;
}

export class LoginResponse {
    __typename?: 'LoginResponse';
    access_token: string;
    user: User;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract login(login_user_input: LoginUserInput): LoginResponse | Promise<LoginResponse>;

    abstract updateProcedures(update_procedures_input: UpdateProceduresInput): Procedures | Promise<Procedures>;

    abstract addHeir(add_heir_user_input: AddHeirInput): AddHeirResponse | Promise<AddHeirResponse>;

    abstract verifyEmailWithInvitation(verify_email_with_invitation_input: VerifyEmailWithInvitationInput): VerifyEmailWithInvitationResponse | Promise<VerifyEmailWithInvitationResponse>;

    abstract confirmSecurityCode(confirm_security_code_input: ConfirmSecurityCodeInput): ConfirmSecurityCodeResponse | Promise<ConfirmSecurityCodeResponse>;

    abstract unlockUrgentData(unlock_urgent_data_input: UnlockUrgentDataInput): UnlockUrgentDataResponse | Promise<UnlockUrgentDataResponse>;

    abstract askResetPasswordUser(ask_reset_password_user_input: AskResetPasswordUserInput): AskResetPasswordUserResponse | Promise<AskResetPasswordUserResponse>;

    abstract createUser(create_user_input: CreateUserInput): User | Promise<User>;

    abstract resetPasswordUser(reset_password_user_input: ResetPasswordUserInput): User | Promise<User>;

    abstract verifyNewEmail(verify_new_email_input: VerifyNewEmailInput): User | Promise<User>;

    abstract updateUser(update_user_input: UpdateUserInput): User | Promise<User>;

    abstract updateWishes(update_wishes_input: UpdateWishesInput): Wishes | Promise<Wishes>;

    abstract verifyEmail(verify_email_input: VerifyEmailInput): VerifyEmailResponse | Promise<VerifyEmailResponse>;
}

export class SensitiveData {
    __typename?: 'SensitiveData';
    procedures: Procedures;
    user_id: string;
}

export class Procedures {
    __typename?: 'Procedures';
    bank_products: BankProduct[];
    life_insurances: LifeInsurance[];
    insurance_products: InsuranceProduct[];
    vehicles: Vehicle[];
    properties: RealEstate[];
    consumer_credits: ConsumerCredit[];
    internet_accounts_to_be_deleted: InternetAccountToBeDeleted[];
}

export class BankProduct {
    __typename?: 'BankProduct';
    type: string;
    company: string;
    localization: string;
}

export class LifeInsurance {
    __typename?: 'LifeInsurance';
    company: string;
    contract_number: string;
}

export class InsuranceProduct {
    __typename?: 'InsuranceProduct';
    type: string;
    company: string;
    localization: string;
}

export class Vehicle {
    __typename?: 'Vehicle';
    type: string;
    registration_number: string;
}

export class RealEstate {
    __typename?: 'RealEstate';
    type: string;
    localization: string;
}

export class ConsumerCredit {
    __typename?: 'ConsumerCredit';
    company: string;
    contract_number: string;
}

export class InternetAccountToBeDeleted {
    __typename?: 'InternetAccountToBeDeleted';
    site: string;
    username: string;
}

export class LifeInsuranceInput {
    __typename?: 'LifeInsuranceInput';
    company: string;
    contract_number: string;
}

export class Heir {
    __typename?: 'Heir';
    _id: string;
    user_details: UserDetails;
    security_code?: Nullable<string>;
    added_date: Date;
    urgent_data_unlocked: boolean;
    urgent_data_unlocked_date?: Nullable<Date>;
    sensitive_data_unlocked: boolean;
    sensitive_data_unlocked_date?: Nullable<Date>;
    state: StateTrust;
}

export class Legator {
    __typename?: 'Legator';
    _id: string;
    user_details: UserDetails;
    added_date: Date;
    state: StateTrust;
    urgent_data_unlocked: boolean;
    urgent_data_unlocked_date?: Nullable<Date>;
    urgent_data?: Nullable<UrgentData>;
    sensitive_data_unlocked: boolean;
    sensitive_data_unlocked_date?: Nullable<Date>;
    sensitive_data?: Nullable<SensitiveData>;
}

export class UserDetails {
    __typename?: 'UserDetails';
    email: string;
    firstname: string;
    lastname: string;
}

export class User {
    __typename?: 'User';
    heirs: Heir[];
    legators: Legator[];
    _id: string;
    email: string;
    firstname: string;
    lastname: string;
    urgent_data: UrgentData;
    sensitive_data: SensitiveData;
}

export class AddHeirResponse {
    __typename?: 'AddHeirResponse';
    heir_user: Heir;
}

export class ConfirmSecurityCodeResponse {
    __typename?: 'ConfirmSecurityCodeResponse';
    legator_user: Legator;
}

export class UnlockUrgentDataResponse {
    __typename?: 'UnlockUrgentDataResponse';
    success: boolean;
}

export class VerifyEmailWithInvitationResponse {
    __typename?: 'VerifyEmailWithInvitationResponse';
    success: boolean;
}

export class AskResetPasswordUserResponse {
    __typename?: 'AskResetPasswordUserResponse';
    success: boolean;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract user(): User | Promise<User>;
}

export class UrgentData {
    __typename?: 'UrgentData';
    user_id: string;
    wishes: Wishes;
}

export class VerifyEmailResponse {
    __typename?: 'VerifyEmailResponse';
    success: boolean;
}

export class Wishes {
    __typename?: 'Wishes';
    burial_cremation?: Nullable<string>;
    burial_cremation_place?: Nullable<string>;
    music?: Nullable<string>;
    religion?: Nullable<string>;
    place?: Nullable<string>;
    prevoyance?: Nullable<string>;
    list_of_people?: Nullable<string>;
    coffin?: Nullable<string>;
    ornament?: Nullable<string>;
    text?: Nullable<string>;
    other?: Nullable<string>;
}

type Nullable<T> = T | null;
