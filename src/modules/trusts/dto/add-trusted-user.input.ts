import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class AddTrustedUserInput {
  @Field(() => String)
  firstname: string;

  @Field(() => String)
  lastname: string;

  @Field(() => String)
  email: string;
}
