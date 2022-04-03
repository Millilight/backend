import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AskResetPasswordUserResponse {
  @Field(() => Boolean)
  success: Boolean;

  @Field(() => String)
  details?: String;
}
