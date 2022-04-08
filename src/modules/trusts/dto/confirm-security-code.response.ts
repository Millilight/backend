import { Field, InputType } from '@nestjs/graphql';

import { LegatorUser } from '../schemas/legatorUsers.schema';

@InputType()
export class ConfirmSecurityCodeResponse {
  @Field(() => String)
  legator_user: LegatorUser;
}
