import { Field, InputType } from '@nestjs/graphql';

import { TrustedUser } from '../schemas/trustedUsers.schema';

@InputType()
export class AddTrustedUserResponse {
  @Field(() => String)
  trusted_user: TrustedUser;
}
