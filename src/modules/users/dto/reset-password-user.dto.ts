import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ResetPasswordUserDto {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  token: string;

  @Field(() => String)
  new_password: string;
}