import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class ConfirmSecurityCodeInput {
  @Field(() => ID)
  legator_user_id: string;

  @Field(() => String)
  security_code: string;
}
