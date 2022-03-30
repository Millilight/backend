import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class LoginUserDto {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}
