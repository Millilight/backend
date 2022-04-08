import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UnlockUrgentDataResponse {
  @Field(() => UrgentData)
  urgent_data: UrgentData;
}
