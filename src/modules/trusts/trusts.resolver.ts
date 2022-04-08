import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { trustToLegatorUser, trustToTrustedUser } from './utils/trust-parsing';

import { AddTrustedUserInput } from './dto/add-trusted-user.input';
import { AddTrustedUserResponse } from './dto/add-trusted-user.response';
import { ConfirmSecurityCodeInput } from './dto/confirm-security-code.input';
import { ConfirmSecurityCodeResponse } from './dto/confirm-security-code.response';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CurrentUser } from '../users/users.decorator';
import { MailService } from '../mail/mail.service';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { StateTrust } from './schemas/trusts.schema';
import { Trust } from './schemas/trusts.schema';
import { TrustsService } from './trusts.service';
import { UseFilters } from '@nestjs/common';
import { User } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import generateToken from '@/utils/generateToken';
import { UnlockUrgentDataInput } from './dto/unlock-urgent-data.input';
import { UnlockUrgentDataResponse } from './dto/unlock-urgent-data.response';

@Resolver(() => Trust)
@UseFilters(MongoExceptionFilter)
export class TrustsResolver {
  constructor(
    private usersService: UsersService,
    private trustsService: TrustsService,
    private mailService: MailService
  ) {}

  @Mutation(() => AddTrustedUserResponse)
  async addTrustedUser(
    @Args('add_trusted_user_input') add_trusted_user_input: AddTrustedUserInput,
    @CurrentUser() current_user: User
  ): Promise<AddTrustedUserResponse> {
    // 1. Get the future trusted user
    let trusted_user = await this.usersService.findByEmail(
      add_trusted_user_input.email
    );
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
    // TODO What if trust already exist
    // TODO What if trusted user didn't verify email
    // 2. Create the trust
    const trust: Trust = {
      state: user_already_exist
        ? StateTrust.WAITING_CONFIRMATION
        : StateTrust.INVITATION_SENT,
      legator_user: current_user,
      trusted_user: trusted_user,
      security_code: generateToken(8),
    };
    const trust_created = await this.trustsService.create(trust);

    // 3. Send a notitication by email
    if (user_already_exist)
      await this.mailService.sendTrustedUserNotification(
        current_user,
        trusted_user
      );
    else
      await this.mailService.sendTrustedUserInvitation(
        current_user,
        trusted_user
      );

    // 4. Return the trusted user
    return { trusted_user: trustToTrustedUser(trust_created) };
  }

  @Mutation(() => AddTrustedUserResponse)
  async confirmSecurityCode(
    @Args('confirm_security_code_input')
    confirm_security_code_input: ConfirmSecurityCodeInput,
    @CurrentUser() current_user: User
  ): Promise<ConfirmSecurityCodeResponse> {
    return this.trustsService
      .confirmSecurityCode(current_user._id, confirm_security_code_input)
      .then(trustToLegatorUser)
      .then((legator_user) => ({ legator_user: legator_user }));
  }

  @Mutation(() => AddTrustedUserResponse)
  async unlockUrgentData(
    @Args('unlock_urgent_data_input')
    unlock_urgent_data_input: UnlockUrgentDataInput,
    @CurrentUser() current_user: User
  ): Promise<UnlockUrgentDataResponse> {
    // 1. unlock the urgent data in the trust by flipping the bool
    const trust = await this.trustsService.unlockUrgentData(
      current_user_id,
      unlock_urgent_data_input
    );

    // 2. send a notification to the legator
    this.mailService.sendTrustedUserInvitation();

    // 3. return urgent Data
  }
}
