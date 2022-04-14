
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

export class UrgentDataInput {
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

export class LoginUserInput {
    email: string;
    password: string;
}

export class ResetPasswordUserInput {
    new_password: string;
    token: string;
    user_id: string;
}

export class UpdateEmailUserInput {
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

export class Heir {
    __typename?: 'Heir';
    _id: string;
    user_details: UserDetails;
    security_code?: Nullable<string>;
    added_date: Date;
    urgent_data_unlocked: boolean;
    urgent_data_unlocked_date?: Nullable<Date>;
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
    urgent_data: UrgentData;
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

export class UrgentDataResponse {
    __typename?: 'UrgentDataResponse';
    urgent_data: UrgentData;
}

export class VerifyEmailWithInvitationResponse {
    __typename?: 'VerifyEmailWithInvitationResponse';
    sucess: boolean;
}

export abstract class IQuery {
    __typename?: 'IQuery';

    abstract urgentData(urgent_data_input: UrgentDataInput): UrgentDataResponse | Promise<UrgentDataResponse>;

    abstract user(): User | Promise<User>;
}

export abstract class IMutation {
    __typename?: 'IMutation';

    abstract addHeir(add_heir_user_input: AddHeirInput): AddHeirResponse | Promise<AddHeirResponse>;

    abstract verifyEmailWithInvitation(verify_email_with_invitation_input: VerifyEmailWithInvitationInput): VerifyEmailWithInvitationResponse | Promise<VerifyEmailWithInvitationResponse>;

    abstract confirmSecurityCode(confirm_security_code_input: ConfirmSecurityCodeInput): ConfirmSecurityCodeResponse | Promise<ConfirmSecurityCodeResponse>;

    abstract unlockUrgentData(unlock_urgent_data_input: UnlockUrgentDataInput): UnlockUrgentDataResponse | Promise<UnlockUrgentDataResponse>;

    abstract askResetPasswordUser(ask_reset_password_user_dto: AskResetPasswordUserInput): AskResetPasswordUserResponse | Promise<AskResetPasswordUserResponse>;

    abstract createUser(create_user_dto: CreateUserInput): User | Promise<User>;

    abstract login(login_user_dto: LoginUserInput): LoginResponse | Promise<LoginResponse>;

    abstract resetPasswordUser(reset_password_user_dto: ResetPasswordUserInput): User | Promise<User>;

    abstract updateEmailUser(update_email_user_dto: UpdateEmailUserInput): User | Promise<User>;

    abstract updateUser(update_user_dto: UpdateUserInput): User | Promise<User>;

    abstract updateWishes(update_wishes_dto: UpdateWishesInput): Wishes | Promise<Wishes>;

    abstract verifyEmail(verify_email_dto: VerifyEmailInput): VerifyEmailResponse | Promise<VerifyEmailResponse>;
}

export class AskResetPasswordUserResponse {
    __typename?: 'AskResetPasswordUserResponse';
    success: boolean;
}

export class LoginResponse {
    __typename?: 'LoginResponse';
    access_token: string;
    user: User;
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
