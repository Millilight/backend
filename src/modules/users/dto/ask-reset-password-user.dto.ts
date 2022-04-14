import { AskResetPasswordUserInput } from '@gqltypes';
import { IsEmail } from 'class-validator';

export class AskResetPasswordUserDto extends AskResetPasswordUserInput {
  @IsEmail()
  email: string;
}
