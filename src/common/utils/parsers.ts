import { LegatorUser, TrustedUser, User } from 'src/graphql';
import { TrustDB, TrustDocument } from 'src/modules/trusts/schemas/trusts.schema';

import { UserDocument } from 'src/modules/users/schemas/user.schema';

export const trustDocToTrustedUser = (
  trust_doc: TrustDocument
): TrustedUser => ({
  _id: trust_doc.trusted_user_id,
  user_details: undefined,
  state: trust_doc.state,
  added_date: trust_doc.added_date,
  urgent_data_unlocked: trust_doc.urgent_data_unlocked,
  urgent_data_unlocked_date: trust_doc.urgent_data_unlocked_date,
});

export const trustDocToLegatorUser = (
  trust_doc: TrustDocument
): LegatorUser => ({
  _id: trust_doc.legator_user_id,
  user_details: undefined,
  state: trust_doc.state,
  added_date: trust_doc.added_date,
  urgent_data_unlocked: trust_doc.urgent_data_unlocked,
  urgent_data_unlocked_date: trust_doc.urgent_data_unlocked_date,
});

export const trustDocToLegatorUserAndTrustedUser = (
  trust_doc: TrustDocument
) => {
  return {
    legator_user: trustDocToLegatorUser(trust_doc),
    trusted_user: trustDocToTrustedUser(trust_doc),
  };
};

export const userDocToUser = (
  user_doc: UserDocument
) : User => ({
  _id: user_doc._id,
  email: user_doc.email,
  firstname: user_doc.firstname,
  lastname: user_doc.lastname,
  urgent_data: { wishes: user_doc.wishes },
  trusted_users: undefined,
  legator_users: undefined
});

