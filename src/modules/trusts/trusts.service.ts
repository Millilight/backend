import { Model } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TrustDB, TrustDocument } from './schemas/trusts.schema';
import { Legator, StateTrust, Heir, User } from 'src/graphql';
import {
  trustDocToLegator,
  trustDocToLegatorAndHeir,
  trustDocToHeir,
} from '@parsers';
import generateToken from '@/utils/generateToken';
import { ConfirmSecurityCodeDto } from './dto/confirm-security-code.dto';
import { UnlockUrgentDataDto } from './dto/unlock-urgent-data.dto';

@Injectable()
export class TrustsService {
  constructor(@InjectModel('Trust') private trustModel: Model<TrustDocument>) {}

  async create(legator_user: User, heir_user: User): Promise<Heir> {
    const trust_db: TrustDB = {
      state: StateTrust.INVITATION_SENT,
      heir_user_id: heir_user._id,
      legator_user_id: legator_user._id,
      security_code: generateToken(8),
    };
    return this.trustModel.create(trust_db).then(trustDocToHeir);
  }

  async confirmSecurityCode(
    current_user: User,
    confirm_security_code_input: ConfirmSecurityCodeDto
  ): Promise<Legator> {
    // 1. Get the trust
    const trust_doc = await this.trustModel.findOne({
      legator_user_id: confirm_security_code_input.legator_user_id,
      heir_user_id: current_user._id,
    });
    if (!trust_doc) throw new NotFoundException();

    // 2. Confirm the code
    if (confirm_security_code_input.security_code !== trust_doc.security_code)
      throw new UnauthorizedException();

    // 3. Update the trust
    trust_doc.security_code = '';
    trust_doc.state = StateTrust.VALIDATED;
    return trust_doc.save().then(trustDocToLegator);
  }

  async unlockUrgentData(
    current_user_id: string,
    unlock_urgent_data_input: UnlockUrgentDataDto
  ): Promise<{ legator_user: Legator; heir_user: Heir }> {
    return this.trustModel
      .findOne({
        legator_user: unlock_urgent_data_input.legator_user_id,
        heir_user: current_user_id,
      })
      .then((trust) => {
        if (!trust) throw new NotFoundException();
        if (trust.urgent_data_unlocked)
          throw new UnauthorizedException('Already unlocked.');
        trust.urgent_data_unlocked = true;
        trust.urgent_data_unlocked_date = new Date();
        return trust.save().then(trustDocToLegatorAndHeir);
      });
  }

  async findAllHeirs(legator_user: Legator | User): Promise<Heir[]> {
    return this.trustModel
      .find({ legator_user_id: legator_user._id })
      .then((docs) => docs.map(trustDocToHeir));
  }

  async findAllLegators(
    heir_user: Heir | User
  ): Promise<Legator[]> {
    return this.trustModel
      .find({ heir_user_id: heir_user._id })
      .then((docs) => docs.map(trustDocToLegator));
  }
}
