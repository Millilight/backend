import { Field, InputType } from "@nestjs/graphql";


@InputType()
export class UpdateWishesDto {
 
  @Field(()=>String, {nullable:true})
  burial_cremation: string;

  @Field(()=>String, {nullable:true})
  burial_cremation_place: string;
}
