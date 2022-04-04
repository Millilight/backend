import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from './users.decorator';
import { Wishes } from './schemas/wishes.schema';
import { UpdateWishesDto } from './dto/update-wishes.dto';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { UpdateUserDto } from './dto/update-user.dto copy';
import { VerifyEmailResponse } from '../auth/verify-email-response.dto';
import { VerifyEmailDto } from '../auth/verify-email.dto';
import { Public } from '../auth/public.decorator';
import { AskResetPasswordUserDto } from './dto/ask-reset-password-user.dto';
import { MailService } from '../mail/mail.service';
import { AskResetPasswordUserResponse } from './dto/ask-reset-password-user-response.dto';
import { ResetPasswordUserDto } from './dto/reset-password-user.dto';
import { ResetPasswordUserResponse } from './dto/reset-password-user-response';

@Resolver(() => User)
@UseFilters(MongoExceptionFilter)
export class UsersResolver {
  constructor(private usersService: UsersService, private mailService: MailService) {}

  @Public()
  @Mutation(() => User)
  async createUser(
    @Args('createUserDto') createUserDto: CreateUserDto
  ): Promise<User> {
    const user = await this.usersService.create(createUserDto);

    await this.mailService.sendUserConfirmation(user);

    return user;
  }

  @Public()
  @Mutation(() => VerifyEmailResponse)
  verifyEmail(@Args('verifyEmailDto') verifyEmailDto: VerifyEmailDto) {
    return this.usersService.verifyEmail(verifyEmailDto);
  }

  // Remember that we use JWTAuthGuard by default so as to protect operations
  @Query(() => User)
  user(@CurrentUser() user: User): User {
    return user;
  }

  @Mutation(() => Wishes)
  async updateWishes(
    @CurrentUser() user: User,
    @Args('updateWishesDto') updateWishesDto: UpdateWishesDto
  ): Promise<Wishes> {
    return await this.usersService
      .updateUser(user, { wishes: updateWishesDto })
      .then((user) => user.wishes);
  }

  @Mutation(() => User)
  async updateUser(
    @CurrentUser() user: User,
    @Args('updateUserDto') updateUserDto: UpdateUserDto
  ): Promise<User> {
    return await this.usersService.updateUser(user, updateUserDto);
  }

  @Mutation(() => AskResetPasswordUserResponse)
  async askResetPasswordUser(
    @Args('askResetPasswordUserDto') askResetPasswordUserDto: AskResetPasswordUserDto
  ): Promise<AskResetPasswordUserResponse> {
    const user = await this.usersService.askResetPassword(askResetPasswordUserDto);

    await this.mailService.resetPasswordEmail(user);
    
    return { success: true };
  }

  @Mutation(() => ResetPasswordUserResponse)
  async resetPasswordUser(
    @Args('resetPasswordUserDto') resetPasswordUserDto: ResetPasswordUserDto
  ): Promise<ResetPasswordUserResponse> {
    let user = await this.usersService.checkResetPassword(resetPasswordUserDto.user_id, resetPasswordUserDto.token); // To be sure the user asked for a password change

    user = await this.usersService.updateUser(user, {password: resetPasswordUserDto.new_password});
    
    return { user: user };
  }
}
