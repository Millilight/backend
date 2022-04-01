import { Args, Mutation, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './login-user.dto';
import { LoginResponse } from './login-response.schema';
import { VerifyEmailResponse } from './verify-email-response.dto';
import { GqlAuthGuard } from './gql-auth.guard';
import { VerifyEmailDto } from './verify-email.dto';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  @UseGuards(GqlAuthGuard)
  login(@Args('loginUserDto') _: LoginUserDto, @Context() context) {
    return this.authService.login(context.user);
  }

  @Mutation(() => VerifyEmailResponse)
  verifyEmail(@Args('verifyEmailDto') verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }
}
