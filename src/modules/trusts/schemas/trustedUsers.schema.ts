import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Trust } from './trusts.schema';

@ObjectType()
export class TrustedUser extends Trust {
  @Field(() => ID)
  _id?: string;

  @Field()
  email?: string;

  @Field()
  firstname?: string;

  @Field()
  lastname?: string;

  @Field({ nullable: true })
  security_code?: string;
}
