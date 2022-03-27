import { Args, Mutation, Resolver, Query } from "@nestjs/graphql";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { User } from "./schemas/user.schema";

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(
    @Args("createUserDto") createUserDto: CreateUserDto
  ): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Query(() => [User])
  async users() {
    return this.usersService.findAll();
  }
}
