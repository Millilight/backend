import { Model } from 'mongoose';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { StateTrust, Trust, TrustDocument } from './schemas/trusts.schema';
import { ConfirmSecurityCodeInput } from './dto/confirm-security-code.input';
import { UnlockUrgentDataInput } from './dto/unlock-urgent-data.input';

@Injectable()
export class TrustsService {
  constructor(
    @InjectModel(Trust.name) private trustModel: Model<TrustDocument>
  ) {}

  async create(trust: Trust): Promise<Trust> {
    return this.trustModel.create(trust);
  }

  async confirmSecurityCode(
    current_user_id: string,
    confirm_security_code_input: ConfirmSecurityCodeInput
  ) {
    // 1. Get the trust
    const trust = await this.trustModel.findOne({
      legator_user: confirm_security_code_input.legator_user_id,
      trusted_user: current_user_id,
    });
    if (!trust) throw new NotFoundException();

    // 2. Confirm the code
    if (confirm_security_code_input.security_code !== trust.security_code)
      throw new UnauthorizedException();

    // 3. Update the trust
    trust.security_code = '';
    trust.state = StateTrust.VALIDATED;
    return trust.save();
  }

  async unlockUrgentData(
    current_user_id: string,
    unlock_urgent_data_input: UnlockUrgentDataInput
  ): Promise<Trust> {
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
        return trust.save();
      });
  }
}
