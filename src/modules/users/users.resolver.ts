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
import { VerifyEmailResponse } from '../auth/verify-email-response.dto';
import { VerifyEmailDto } from '../auth/verify-email.dto';

@Resolver(() => User)
@UseFilters(MongoExceptionFilter)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(
    @Args('createUserDto') createUserDto: CreateUserDto
  ): Promise<User> {
    return await this.usersService.create(createUserDto);
  }

  @Mutation(() => VerifyEmailResponse)
  verifyEmail(@Args('verifyEmailDto') verifyEmailDto: VerifyEmailDto) {
    return this.usersService.verifyEmail(verifyEmailDto);
  }

  // TODO : if the vast majority of the operations are protected : https://docs.nestjs.com/security/authentication#login-route
  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  user(@CurrentUser() user: User): User {
    return user;
  }

  @Mutation(() => Wishes)
  @UseGuards(JwtAuthGuard)
  async updateWishes(
    @CurrentUser() user: User,
    @Args('updateWishesDto') updateWishesDto: UpdateWishesDto
  ): Promise<Wishes> {
    return await this.usersService
      .updateUser(user, { wishes: updateWishesDto })
      .then((user) => user.wishes);
  }
}
