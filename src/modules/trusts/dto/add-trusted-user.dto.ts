import { AddHeirInput } from '../../../graphql';
import { IsEmail } from 'class-validator';

export class AddHeirDto extends AddHeirInput {
  @IsEmail()
  email: string;
}
