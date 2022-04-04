import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './login-user.dto';
import { LoginResponse } from './login-response.schema';
import { GqlAuthGuard } from './gql-auth.guard';
import { Public } from './public.decorator';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Public()
  @Mutation(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  login(@Args('login_user_dto') _: LoginUserDto, @Context() context) {
    return this.authService.login(context.user);
  }
}
