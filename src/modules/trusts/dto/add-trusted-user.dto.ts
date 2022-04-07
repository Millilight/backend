import { AddTrustedUserInput } from '../../../graphql';
import { IsEmail } from 'class-validator';

export class AddTrustedUserDto extends AddTrustedUserInput {
  @IsEmail()
  email: string;
}
