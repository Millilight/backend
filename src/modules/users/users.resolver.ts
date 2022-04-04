import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { CurrentUser } from './users.decorator';
import { Wishes } from './schemas/wishes.schema';
import { UpdateWishesDto } from './dto/update-wishes.dto';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyEmailResponse } from '../auth/verify-email-response.dto';
import { VerifyEmailDto } from '../auth/verify-email.dto';
import { Public } from '../auth/public.decorator';
import { AskResetPasswordUserDto } from './dto/ask-reset-password-user.dto';
import { MailService } from '../mail/mail.service';
import { AskResetPasswordUserResponse } from './dto/ask-reset-password-user-response.dto';
import { ResetPasswordUserDto } from './dto/reset-password-user.dto';
import { UpdateEmailUserDto } from './dto/update-email-user.dto';

@Resolver(() => User)
@UseFilters(MongoExceptionFilter)
export class UsersResolver {
  constructor(private usersService: UsersService, private mailService: MailService) {}

  @Public()
  @Mutation(() => User)
  async createUser(
    @Args('create_user_dto') create_user_dto: CreateUserDto
  ): Promise<User> {
    const user = await this.usersService.create(create_user_dto);

    await this.mailService.sendUserConfirmation(user);

    return user;
  }

  @Public()
  @Mutation(() => VerifyEmailResponse)
  verifyEmail(@Args('verify_email_dto') verify_email_dto: VerifyEmailDto) {
    return this.usersService.verifyEmail(verify_email_dto);
  }

  // Remember that we use JWTAuthGuard by default so as to protect operations
  @Query(() => User)
  user(@CurrentUser() user: User): User {
    return user;
  }

  @Mutation(() => Wishes)
  async updateWishes(
    @CurrentUser() user: User,
    @Args('update_wishes_dto') update_wishes_dto: UpdateWishesDto
  ): Promise<Wishes> {
    return await this.usersService
      .updateUser(user, { wishes: update_wishes_dto })
      .then((user) => user.wishes);
  }

  @Mutation(() => User)
  async updateUser(
    @CurrentUser() user: User,
    @Args('update_user_dto') update_user_dto: UpdateUserDto
  ): Promise<User> {
    let new_user = await this.usersService.updateUser(user, update_user_dto);

    if(update_user_dto.new_email) {
      new_user = await this.usersService.findByIDWithNewEmailAndNewEmailToken(new_user._id);
      await this.mailService.sendUserEmailUpdate(new_user);
    }

    return new_user;
  }

  @Public()
  @Mutation(() => AskResetPasswordUserResponse)
  async askResetPasswordUser(
    @Args('ask_reset_password_user_dto') ask_reset_password_user_dto: AskResetPasswordUserDto
  ): Promise<AskResetPasswordUserResponse> {
    const user = await this.usersService.askResetPassword(ask_reset_password_user_dto);

    await this.mailService.resetPassword(user);
    
    return { success: true };
  }

  @Public()
  @Mutation(() => User)
  async resetPasswordUser(
    @Args('reset_password_user_dto') reset_password_user_dto: ResetPasswordUserDto
  ): Promise<User> {
    let user = await this.usersService.checkResetPassword(reset_password_user_dto.user_id, reset_password_user_dto.token); // To be sure the user asked for a password change

    return await this.usersService.updateUser(user, {password: reset_password_user_dto.new_password});
  }

  // The user needs to ask before (see updateUser mutation)
  @Public()
  @Mutation(() => User)
  async updateEmailUser(
    @Args('update_email_user_dto') update_email_user_dto: UpdateEmailUserDto
  ): Promise<User> {
    let user = await this.usersService.findByIDAndNewMailTokenWithNewEMailAndNewEmailToken(update_email_user_dto.user_id, update_email_user_dto.token); // To be sure the user asked for an email change
    
    return await this.usersService.updateEmailUser(user);
  }
}
