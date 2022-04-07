import { Model } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TrustDB, TrustDocument } from './schemas/trusts.schema';
import { LegatorUser, StateTrust, TrustedUser, User } from 'src/graphql';
import {
  trustDocToLegatorUser,
  trustDocToLegatorUserAndTrustedUser,
  trustDocToTrustedUser,
} from '@parsers';
import generateToken from '@/utils/generateToken';
import { ConfirmSecurityCodeDto } from './dto/confirm-security-code.dto';
import { UnlockUrgentDataDto } from './dto/unlock-urgent-data.dto';

@Injectable()
export class TrustsService {
  constructor(@InjectModel('Trust') private trustModel: Model<TrustDocument>) {}

  async create(legator_user: User, trusted_user: User): Promise<TrustedUser> {
    const trust_db: TrustDB = {
      state: StateTrust.INVITATION_SENT,
      trusted_user_id: trusted_user._id,
      legator_user_id: legator_user._id,
      security_code: generateToken(8),
    };
    return this.trustModel.create(trust_db).then(trustDocToTrustedUser);
  }

  async confirmSecurityCode(
    current_user: User,
    confirm_security_code_input: ConfirmSecurityCodeDto
  ): Promise<LegatorUser> {
    // 1. Get the trust
    const trust_doc = await this.trustModel.findOne({
      legator_user: confirm_security_code_input.legator_user_id,
      trusted_user: current_user._id,
    });
    if (!trust_doc) throw new NotFoundException();

    // 2. Confirm the code
    if (confirm_security_code_input.security_code !== trust_doc.security_code)
      throw new UnauthorizedException();

    // 3. Update the trust
    trust_doc.security_code = '';
    trust_doc.state = StateTrust.VALIDATED;
    return trust_doc.save().then(trustDocToLegatorUser);
  }

  async unlockUrgentData(
    current_user_id: string,
    unlock_urgent_data_input: UnlockUrgentDataDto
  ): Promise<{ legator_user: LegatorUser; trusted_user: TrustedUser }> {
    return this.trustModel
      .findOne({
        legator_user: unlock_urgent_data_input.legator_user_id,
        trusted_user: current_user_id,
      })
      .then((trust) => {
        if (!trust) throw new NotFoundException();
        if (trust.urgent_data_unlocked)
          throw new UnauthorizedException('Already unlocked.');
        trust.urgent_data_unlocked = true;
        trust.urgent_data_unlocked_date = new Date();
        return trust.save().then(trustDocToLegatorUserAndTrustedUser);
      });
  }

  async findAllHeirs(legator_user: LegatorUser | User): Promise<TrustedUser[]> {
    return this.trustModel
      .find({ legator_user: legator_user._id })
      .then((docs) => docs.map(trustDocToTrustedUser));
  }

  async findAllLegators(
    trusted_user: TrustedUser | User
  ): Promise<LegatorUser[]> {
    return this.trustModel
      .find({ trusted_user: trusted_user._id })
      .then((docs) => docs.map(trustDocToLegatorUser));
  }
}
