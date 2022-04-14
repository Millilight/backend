import { Heir, Legator, User, Wishes } from 'src/graphql';

import { TrustDocument } from 'src/modules/trusts/schemas/trusts.schema';
import { UserDocument } from 'src/modules/users/schemas/user.schema';
import { WishesDocument } from 'src/modules/wishes/schemas/wishes.schema';

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
  urgent_data: { user_id: trust_doc._id as string, wishes: undefined },
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
