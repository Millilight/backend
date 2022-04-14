import { IsEmail } from 'class-validator';
import { LoginUserInput } from '@gqltypes';

export class LoginUserDto extends LoginUserInput {
  @IsEmail()
  email: string;
}
