import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AskResetPasswordUserDto {
  @Field(() => String)
  email: string;
}
