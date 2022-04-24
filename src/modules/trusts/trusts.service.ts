import { Model } from 'mongoose';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TrustDB, TrustDocument } from './schemas/trusts.schema';
import { Legator, StateTrust, Heir, User } from '@gqltypes';
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
  constructor(@InjectModel('Trusts') private trustsModel: Model<TrustDocument>) {}

  async create(legator_user: User, heir_user: User): Promise<Heir> {
    // Do not create duplicated trusts
    const trust_doc = await this.trustsModel.findOne({
      legator_user_id: legator_user._id,
      heir_user_id: heir_user._id
    })
    if(trust_doc) throw new ConflictException('Trust already registered');
    
    // Do not authorize trust with oneself
    if(legator_user._id === heir_user._id)
      throw new ConflictException('Unable to create a trust with oneself');

    const trust_db: TrustDB = {
      state: StateTrust.INVITATION_SENT,
      heir_user_id: heir_user._id,
      legator_user_id: legator_user._id,
      security_code: generateToken(8),
      added_date: undefined,
      urgent_data_unlocked: false,
      sensitive_data_unlocked: false
    };
    return this.trustsModel.create(trust_db).then(trustDocToHeir);
  }

  async confirmSecurityCode(
    current_user: User,
    confirm_security_code_input: ConfirmSecurityCodeDto
  ): Promise<Legator> {
    // 1. Get the trust
    const trust_doc = await this.trustsModel.findOne({
      legator_user_id: confirm_security_code_input.legator_user_id,
      heir_user_id: current_user._id,
    });
    if (!trust_doc) throw new NotFoundException();

    // 2. Confirm the code
    if(trust_doc.security_code === '')
      throw new ConflictException('Trust already confirmed');
    if (confirm_security_code_input.security_code !== trust_doc.security_code)
      throw new UnauthorizedException('Wrong security code');

    // 3. Update the trust
    trust_doc.security_code = '';
    trust_doc.state = StateTrust.VALIDATED;
    return trust_doc.save().then(trustDocToLegator);
  }

  async unlockUrgentData(
    current_user_id: string,
    unlock_urgent_data_input: UnlockUrgentDataDto
  ): Promise<{ legator_user: Legator; heir_user: Heir }> {
    return this.trustsModel
      .findOne({
        legator_user_id: unlock_urgent_data_input.legator_user_id,
        heir_user_id: current_user_id,
      })
      .then((trust) => {
        if (!trust) throw new NotFoundException();
        if (trust.urgent_data_unlocked)
          throw new ConflictException('Already unlocked');
        trust.urgent_data_unlocked = true;
        trust.urgent_data_unlocked_date = new Date();
        return trust.save().then(trustDocToLegatorAndHeir);
      });
  }

  async findAllHeirs(legator_user: Legator | User): Promise<Heir[]> {
    return this.trustsModel
      .find({ legator_user_id: legator_user._id })
      .then((docs) => docs.map(trustDocToHeir));
  }

  async findAllLegators(heir_user: Heir | User): Promise<Legator[]> {
    return this.trustsModel
      .find({ heir_user_id: heir_user._id })
      .then((docs) => docs.map(trustDocToLegator));
  }
}
