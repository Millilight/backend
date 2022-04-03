import { Field, ObjectType } from "@nestjs/graphql";

import { User } from "../schemas/user.schema";

@ObjectType()
export class ResetPasswordUserResponse {
  @Field(() => User)
  user: User;
}