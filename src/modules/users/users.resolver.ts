import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from './users.decorator';
import { Wishes } from './schemas/wishes.schema';
import { UpdateWishesDto } from './dto/update-wishes.dto';
@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(
    @Args('createUserDto') createUserDto: CreateUserDto
  ): Promise<User> {
    return this.usersService.create(createUserDto);
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
    @Args("updateWishesDto") updateWishesDto: UpdateWishesDto
  ): Promise<Wishes> {
    //TODO service updateUser
    return this.usersService.updateWishes(user, updateWishesDto);
  }
}
