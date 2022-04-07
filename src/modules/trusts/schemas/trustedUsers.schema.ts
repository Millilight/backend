import { Field, ObjectType } from '@nestjs/graphql';

import { Trust } from './trusts.schema';

export enum StateTrustedUser {
  FILLED,
  INVITATION_SENT,
  USER_CREATED,
  VALIDATED,
}

@ObjectType()
export class TrustedUser extends Trust {
  @Field({ nullable: true })
  security_code?: string;

  @Field(() => StateTrustedUser)
  state: StateTrustedUser;
}
