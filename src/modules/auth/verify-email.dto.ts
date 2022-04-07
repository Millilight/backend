import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class VerifyEmailDto {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  token: string;

  @Field(() => String, { nullable: true })
  password?: string;
}
