import { Field, InputType } from '@nestjs/graphql';

import { UrgentData } from 'src/modules/users/schemas/wishes.schema';

@InputType()
export class UnlockUrgentDataResponse {
  @Field(() => UrgentData)
  urgent_data: UrgentData;
}
