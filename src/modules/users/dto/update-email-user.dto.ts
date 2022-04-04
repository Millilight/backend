import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateEmailUserDto {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  token: string;
}
