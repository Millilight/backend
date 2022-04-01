import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class VerifyEmailResponse {
  @Field(() => Boolean)
  success: Boolean;
}
