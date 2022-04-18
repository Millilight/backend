import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { AskResetPasswordUserResponse, User } from '@gqltypes';

import { CurrentUser } from './users.decorator';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { Public } from '../auth/public.decorator';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AskResetPasswordUserDto } from './dto/ask-reset-password-user.dto';
import { ResetPasswordUserDto } from './dto/reset-password-user.dto';
import { VerifyNewEmailDto } from './dto/verify-new-email.dto';

@Resolver('User')
@UseFilters(MongoExceptionFilter)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private mailService: MailService
  ) {}

  /* QUERIES */

  // Remember that we use JWTAuthGuard by default so as to protect operations
  @Query()
  user(@CurrentUser() user: User): User {
    return user;
  }

  /* MUTATIONS */

  @Public()
  @Mutation()
  async createUser(
    @Args('create_user_input') create_user_dto: CreateUserDto
  ): Promise<User> {
    const user = await this.usersService.create(create_user_dto);

    const signup_mail_token = await this.usersService.getSignupMailToken(
      user._id
    );
    await this.mailService.sendUserConfirmation(user, signup_mail_token);

    return user;
  }

  @Public()
  @Mutation()
  async verifyEmail(
    @Args('verify_email_input') verify_email_dto: VerifyEmailDto
  ) {
    await this.usersService.verifyEmail(verify_email_dto);
    return { success: true };
  }

  @Mutation()
  async updateUser(
    @CurrentUser() user: User,
    @Args('update_user_input') update_user_dto: UpdateUserDto
  ): Promise<User> {
    const new_user = await this.usersService.update(user, update_user_dto);

    // Send a mail to verify the new email
    if (update_user_dto.new_email) {
      const { new_email, new_email_token } =
        await this.usersService.getNewEmailAndToken(new_user._id);
      await this.mailService.sendUserEmailUpdate(
        new_user,
        new_email,
        new_email_token
      );
    }

    return new_user;
  }

  @Public()
  @Mutation()
  async askResetPasswordUser(
    @Args('ask_reset_password_user_input')
    ask_reset_password_user_dto: AskResetPasswordUserDto
  ): Promise<AskResetPasswordUserResponse> {
    const { user, reset_password_token } =
      await this.usersService.askResetPassword(ask_reset_password_user_dto);

    await this.mailService.resetPassword(user, reset_password_token);

    return { success: true };
  }

  @Public()
  @Mutation()
  async resetPasswordUser(
    @Args('reset_password_user_input')
    reset_password_user_dto: ResetPasswordUserDto
  ): Promise<User> {
    return this.usersService.verifyTokenAndResetPassword(
      reset_password_user_dto
    );
  }

  @Public()
  @Mutation()
  verifyNewEmail(
    @Args('verify_new_email_input') verify_new_email_dto: VerifyNewEmailDto
  ): Promise<User> {
    return this.usersService.verifyNewEmail(verify_new_email_dto);
  }
}
