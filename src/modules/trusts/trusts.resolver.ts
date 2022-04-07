import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { AddTrustedUserDto } from './dto/add-trusted-user.dto';
import { ConfirmSecurityCodeDto } from './dto/confirm-security-code.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CurrentUser } from '../users/users.decorator';
import { MailService } from '../mail/mail.service';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { TrustsService } from './trusts.service';
import { UseFilters } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import generateToken from '@/utils/generateToken';
import { UnlockUrgentDataDto } from './dto/unlock-urgent-data.dto';
import {
  AddTrustedUserResponse,
  ConfirmSecurityCodeResponse,
  LegatorUser,
  TrustedUser,
  UnlockUrgentDataResponse,
  User,
  UserDetails,
  VerifyEmailWithInvitationResponse,
} from 'src/graphql';
import { Public } from '../auth/public.decorator';
import { VerifyEmailWithInvitationDto } from './dto/verify-email-with-invitation.dto';
import convertToDotNotation from '@/utils/convertToDotNotation';


@Resolver()
@UseFilters(MongoExceptionFilter)
export class TrustsResolver {
  constructor(
    private usersService: UsersService,
    private trustsService: TrustsService,
    private mailService: MailService
  ) {}

  // TODO : conflict if trust already exists
  @Mutation()
  async addTrustedUser(
    @Args('add_trusted_user_input') add_trusted_user_input: AddTrustedUserDto,
    @CurrentUser() current_user: User
  ): Promise<AddTrustedUserResponse> {
    const legator_user = current_user;

    // 1. Get the future trusted user
    let trusted_user;
    try {
      trusted_user = await this.usersService.findByEmail(
        add_trusted_user_input.email
      );
    } catch {}
    const user_already_exist = trusted_user ? true : false;
    let create_user_dto: CreateUserDto;
    if (!user_already_exist) {
      create_user_dto = {
        firstname: add_trusted_user_input.firstname,
        lastname: add_trusted_user_input.lastname,
        email: add_trusted_user_input.email,
        password: generateToken(32),
      };
      trusted_user = await this.usersService.create(create_user_dto);
    }

    // 2. Create the trust
    const trusted_user_created = await this.trustsService.create(
      legator_user,
      trusted_user
    );

    // 3. Send a notitication by email
    if (user_already_exist)
      await this.mailService.sendTrustedUserNotification(
        legator_user,
        trusted_user
      );
    else {
      const signup_mail_token = await this.usersService.getSignupMailToken(
        trusted_user._id
      );
      await this.mailService.sendTrustedUserInvitation(
        legator_user,
        trusted_user,
        signup_mail_token
      );
    }

    // 4. Return the trusted user
    return { trusted_user: trusted_user_created };
  }

  @Mutation()
  async confirmSecurityCode(
    @Args('confirm_security_code_input')
    confirm_security_code_input: ConfirmSecurityCodeDto,
    @CurrentUser() current_user: User
  ): Promise<ConfirmSecurityCodeResponse> {
    return this.trustsService
      .confirmSecurityCode(current_user, confirm_security_code_input)
      .then((legator_user) => ({ legator_user: legator_user }));
  }

  @Mutation()
  async unlockUrgentData(
    @Args('unlock_urgent_data_input')
    unlock_urgent_data_input: UnlockUrgentDataDto,
    @CurrentUser() current_user: User
  ): Promise<UnlockUrgentDataResponse> {
    // 1. unlock the urgent data in the trust by flipping the bool
    const { legator_user, trusted_user } =
      await this.trustsService.unlockUrgentData(
        current_user._id,
        unlock_urgent_data_input
      );

    // 2. send a notification to the legator
    await this.mailService.sendUnlockedUrgentDataNotification(
      legator_user,
      await this.usersService.userDetailsByID(legator_user._id),
      trusted_user,
      await this.usersService.userDetailsByID(trusted_user._id)
    );

    // 3. return urgent Data
    return {
      urgent_data: await this.usersService.getUrgentData(legator_user._id),
    };
  }

  @Public()
  @Mutation()
  async verifyEmailWithInvitation(
    @Args('verify_email_with_invitation_input')
    verify_email_with_invitation_dto: VerifyEmailWithInvitationDto,
  ): Promise<VerifyEmailWithInvitationResponse> {
    // Verify email
    const user = await this.usersService.verifyEmail(verify_email_with_invitation_dto);

    // Remplace the temporary password
    await this.usersService.updateUser(user, convertToDotNotation(verify_email_with_invitation_dto.password));

    return { sucess: true };
  }
}

@Resolver(TrustedUser)
export class TrustedUserResolver {
  constructor(
    private usersService: UsersService,
  ) {}

  @ResolveField('user_details')
  async trustedUserDetails(
    @Parent() trusted_user: TrustedUser
  ): Promise<UserDetails> {
    return this.usersService.userDetailsByID(trusted_user._id);
  }
}

@Resolver('User')
export class TrustExtendUserResolver {
  constructor(private trustsService: TrustsService) {}

  @ResolveField('trusted_users')
  async trustedUsers(@Parent() user: User): Promise<TrustedUser[]> {
    return this.trustsService.findAllHeirs(user);
  }

  @ResolveField('legator_users')
  async legatorUsers(@Parent() user: User): Promise<LegatorUser[]> {
    return this.trustsService.findAllLegators(user);
  }
}

@Resolver(LegatorUser)
export class LegatorUserResolver {
  constructor(
    private usersService: UsersService,
  ) {}

  @ResolveField('user_details')
  async legatorUserDetails(
    @Parent() legator_user: LegatorUser
  ): Promise<UserDetails> {
    return this.usersService.userDetailsByID(legator_user._id);
  }
}
