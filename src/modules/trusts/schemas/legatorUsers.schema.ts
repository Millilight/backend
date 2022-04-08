import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Trust } from './trusts.schema';

@ObjectType()
export class LegatorUser extends Trust {
  @Field(() => ID)
  _id?: string;

  @Field()
  email?: string;

  @Field()
  firstname?: string;

  @Field()
  lastname?: string;
}
