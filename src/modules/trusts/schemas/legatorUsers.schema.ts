import { Field, ObjectType } from '@nestjs/graphql';

import { Trust } from './trusts.schema';

export enum StateLegatorUser {
  WAITING_CONFIRMATION,
  VALIDATED,
}

@ObjectType()
export class LegatorUser extends Trust {
  @Field(() => StateLegatorUser)
  state: StateLegatorUser;

  @Field()
  urgent_data_unlocked: boolean;

  @Field()
  urgent_data_unlocked_date: Date;
}
