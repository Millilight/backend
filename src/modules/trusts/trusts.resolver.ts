import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { AddHeirDto } from './dto/add-trusted-user.dto';
import { ConfirmSecurityCodeDto } from './dto/confirm-security-code.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CurrentUser } from '../users/users.decorator';
import { MailService } from '../mail/mail.service';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { TrustsService } from './trusts.service';
import { UnauthorizedException, UseFilters } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import generateToken from '@/utils/generateToken';
import { UnlockUrgentDataDto } from './dto/unlock-urgent-data.dto';
import {
  AddHeirResponse,
  ConfirmSecurityCodeResponse,
  Legator,
  Heir,
  UnlockUrgentDataResponse,
  User,
  UserDetails,
  VerifyEmailWithInvitationResponse,
  UrgentData,
} from 'src/graphql';
import { Public } from '../auth/public.decorator';
import { VerifyEmailWithInvitationDto } from './dto/verify-email-with-invitation.dto';

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
  async addHeir(
    @Args('add_heir_user_input') add_heir_user_input: AddHeirDto,
    @CurrentUser() current_user: User
  ): Promise<AddHeirResponse> {
    const legator_user = current_user;

    // 1. Get the future trusted user
    let heir_user;
    try {
      heir_user = await this.usersService.findByEmail(
        add_heir_user_input.email
      );
    } catch (NotFoundException) {}
    const user_already_exist = heir_user ? true : false;
    let create_user_dto: CreateUserDto;
    if (!user_already_exist) {
      create_user_dto = {
        firstname: add_heir_user_input.firstname,
        lastname: add_heir_user_input.lastname,
        email: add_heir_user_input.email,
        password: generateToken(32),
      };
      heir_user = await this.usersService.create(create_user_dto);
    }

    // 2. Create the trust
    const heir_user_created = await this.trustsService.create(
      legator_user,
      heir_user
    );

    // 3. Send a notitication by email
    if (user_already_exist)
      await this.mailService.sendHeirNotification(legator_user, heir_user);
    else {
      const signup_mail_token = await this.usersService.getSignupMailToken(
        heir_user._id
      );
      await this.mailService.sendHeirInvitation(
        legator_user,
        heir_user,
        signup_mail_token
      );
    }

    // 4. Return the trusted user
    return { heir_user: heir_user_created };
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
    const { legator_user, heir_user } =
      await this.trustsService.unlockUrgentData(
        current_user._id,
        unlock_urgent_data_input
      );

    // 2. send a notification to the legator
    await this.mailService.sendUnlockedUrgentDataNotification(
      legator_user,
      await this.usersService.userDetailsByID(legator_user._id),
      heir_user,
      await this.usersService.userDetailsByID(heir_user._id)
    );

    // 3. return urgent Data
    return {
      success: true,
    };
  }

  @Public()
  @Mutation()
  async verifyEmailWithInvitation(
    @Args('verify_email_with_invitation_input')
    verify_email_with_invitation_dto: VerifyEmailWithInvitationDto
  ): Promise<VerifyEmailWithInvitationResponse> {
    // Verify email
    const user = await this.usersService.verifyEmail(
      verify_email_with_invitation_dto
    );

    // Remplace the temporary password
    await this.usersService.update(user, {
      password: verify_email_with_invitation_dto.password,
    });

    return { sucess: true };
  }
}

@Resolver(Heir)
export class HeirResolver {
  constructor(private usersService: UsersService) {}

  @ResolveField('user_details')
  async HeirDetails(@Parent() heir_user: Heir): Promise<UserDetails> {
    return this.usersService.userDetailsByID(heir_user._id);
  }
}

@Resolver('User')
export class TrustExtendUserResolver {
  constructor(private trustsService: TrustsService) {}

  @ResolveField('heirs')
  async Heirs(@Parent() user: User): Promise<Heir[]> {
    return this.trustsService.findAllHeirs(user);
  }

  @ResolveField('legators')
  async Legators(@Parent() user: User): Promise<Legator[]> {
    return this.trustsService.findAllLegators(user);
  }
}

@Resolver(Legator)
export class LegatorResolver {
  constructor(private usersService: UsersService) {}

  @ResolveField('user_details')
  async LegatorDetails(@Parent() legator_user: Legator): Promise<UserDetails> {
    return this.usersService.userDetailsByID(legator_user._id);
  }
}
