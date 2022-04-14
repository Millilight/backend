import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './gql-auth.guard';
import { Public } from './public.decorator';
import { LoginResponse } from '@gqltypes';
import { LoginUserDto } from './dto/login-user.dto';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Public()
  @Mutation(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  login(@Args('login_user_input') _: LoginUserDto, @Context() context) {
    return this.authService.login(context.user);
  }
}
