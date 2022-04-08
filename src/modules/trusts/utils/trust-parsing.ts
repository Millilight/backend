import { LegatorUser } from '../schemas/legatorUsers.schema';
import { Trust } from '../schemas/trusts.schema';
import { TrustedUser } from '../schemas/trustedUsers.schema';

export const trustToTrustedUser = (trust: Trust): TrustedUser => ({
  _id: trust.trusted_user._id,
  email: trust.trusted_user.email,
  firstname: trust.trusted_user.firstname,
  lastname: trust.trusted_user.lastname,
  state: trust.state,
  added_date: trust.added_date,
  urgent_data_unlocked: trust.urgent_data_unlocked,
  urgent_data_unlocked_date: trust.urgent_data_unlocked_date,
});

export const trustToLegatorUser = (trust: Trust): LegatorUser => ({
  _id: trust.legator_user._id,
  email: trust.legator_user.email,
  firstname: trust.legator_user.firstname,
  lastname: trust.legator_user.lastname,
  state: trust.state,
  added_date: trust.added_date,
  urgent_data_unlocked: trust.urgent_data_unlocked,
  urgent_data_unlocked_date: trust.urgent_data_unlocked_date,
});
