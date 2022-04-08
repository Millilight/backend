import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class UnlockUrgentDataInput {
  @Field(() => ID)
  legator_user_id: string;
}
