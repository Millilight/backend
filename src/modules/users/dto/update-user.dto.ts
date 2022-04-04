import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserDto {
  @Field(() => String, { nullable: true })
  firstname: string;

  @Field(() => String, { nullable: true })
  lastname: string;

  @Field(() => String, { nullable: true })
  password: string;

  @Field(() => String, { nullable: true })
  new_email: string;
}
