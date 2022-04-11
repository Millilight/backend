import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  AskResetPasswordUserDto,
  AskResetPasswordUserResponse,
  CreateUserDto,
  ResetPasswordUserDto,
  UpdateEmailUserDto,
  UpdateUserDto,
  User,
  VerifyEmailDto,
  Wishes,
} from '../../graphql';
import { CurrentUser } from './users.decorator';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { Public } from '../auth/public.decorator';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { UpdateWishesDto } from './dto/update-wishes.dto';

@Resolver('User')
@UseFilters(MongoExceptionFilter)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService
  ) {}

  @Public()
  @Mutation()
  async createUser(
    @Args('create_user_dto') create_user_dto: CreateUserDto
  ): Promise<User> {
    const user = await this.usersService.create(create_user_dto);

    if (this.configService.get<string>('node_env') !== 'DEVELOPMENT') {
      const signup_mail_token = await this.usersService.getSignupMailToken(
        user._id
      );
      await this.mailService.sendUserConfirmation(user, signup_mail_token);
    }

    return user;
  }

  @Public()
  @Mutation()
  async verifyEmail(
    @Args('verify_email_dto') verify_email_dto: VerifyEmailDto
  ) {
    await this.usersService.verifyEmail(verify_email_dto);
    return { success: true };
  }

  // Remember that we use JWTAuthGuard by default so as to protect operations
  @Query()
  user(@CurrentUser() user: User): User {
    return user;
  }

  @Mutation()
  async updateWishes(
    @CurrentUser() user: User,
    @Args('update_wishes_dto') update_wishes_dto: UpdateWishesDto
  ): Promise<Wishes> {
    return await this.usersService
      .updateWishes(user, update_wishes_dto)
      .then((user) => user.urgent_data.wishes);
  }

  @Mutation()
  async updateUser(
    @CurrentUser() user: User,
    @Args('update_user_dto') update_user_dto: UpdateUserDto
  ): Promise<User> {
    const new_user = await this.usersService.updateUser(user, update_user_dto);

    if (update_user_dto.new_email) {
      // TODO : revoir si optimisable
      const new_email = await this.usersService.getNewEmail(new_user._id);
      const new_email_token = await this.usersService.getNewEmailToken(
        new_user._id
      );
      if (this.configService.get<string>('node_env') !== 'DEVELOPMENT')
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
    @Args('ask_reset_password_user_dto')
    ask_reset_password_user_dto: AskResetPasswordUserDto
  ): Promise<AskResetPasswordUserResponse> {
    const user = await this.usersService.askResetPassword(
      ask_reset_password_user_dto
    );

    if (this.configService.get<string>('node_env') !== 'DEVELOPMENT') {
      const reset_password_token =
        await this.usersService.getResetPasswordToken(user._id);
      await this.mailService.resetPassword(user, reset_password_token);
    }

    return { success: true };
  }

  @Public()
  @Mutation()
  async resetPasswordUser(
    @Args('reset_password_user_dto')
    reset_password_user_dto: ResetPasswordUserDto
  ): Promise<User> {
    const user = await this.usersService.checkResetPassword(
      reset_password_user_dto.user_id,
      reset_password_user_dto.token
    ); // To be sure the user asked for a password change

    return await this.usersService.updateUser(user, {
      password: reset_password_user_dto.new_password,
    });
  }

  // The user needs to ask before (see updateUser mutation)
  @Public()
  @Mutation()
  async updateEmailUser(
    @Args('update_email_user_dto') update_email_user_dto: UpdateEmailUserDto
  ): Promise<User> {
    const user =
      await this.usersService.findByIDAndNewMailTokenWithNewEMailAndNewEmailToken(
        update_email_user_dto.user_id,
        update_email_user_dto.token
      ); // To be sure the user asked for an email change

    return await this.usersService.updateEmailUser(user);
  }
}
