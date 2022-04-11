import { Heir, Legator, User } from 'src/graphql';

import { TrustDocument } from 'src/modules/trusts/schemas/trusts.schema';
import { UserDocument } from 'src/modules/users/schemas/user.schema';

export const trustDocToHeir = (trust_doc: TrustDocument): Heir => ({
  _id: trust_doc.heir_user_id,
  user_details: undefined,
  state: trust_doc.state,
  security_code: trust_doc.security_code,
  added_date: trust_doc.added_date,
  urgent_data_unlocked: trust_doc.urgent_data_unlocked,
  urgent_data_unlocked_date: trust_doc.urgent_data_unlocked_date,
});

export const trustDocToLegator = (trust_doc: TrustDocument): Legator => ({
  _id: trust_doc.legator_user_id,
  user_details: undefined,
  state: trust_doc.state,
  added_date: trust_doc.added_date,
  urgent_data_unlocked: trust_doc.urgent_data_unlocked,
  urgent_data_unlocked_date: trust_doc.urgent_data_unlocked_date,
});

export const trustDocToLegatorAndHeir = (trust_doc: TrustDocument) => {
  return {
    legator_user: trustDocToLegator(trust_doc),
    heir_user: trustDocToHeir(trust_doc),
  };
};

export const userDocToUser = (user_doc: UserDocument): User => ({
  _id: user_doc._id,
  email: user_doc.email,
  firstname: user_doc.firstname,
  lastname: user_doc.lastname,
  urgent_data: { wishes: user_doc.wishes },
  heir_users: undefined,
  legator_users: undefined,
});
