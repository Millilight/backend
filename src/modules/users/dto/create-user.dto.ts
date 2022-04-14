import { CreateUserInput } from '@gqltypes';
import { IsEmail } from 'class-validator';

export class CreateUserDto extends CreateUserInput {
  @IsEmail()
  email: string;
}
