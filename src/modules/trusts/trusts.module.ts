import {
  HeirResolver,
  LegatorResolver,
  TrustExtendUserResolver,
  TrustsResolver,
} from './trusts.resolver';

import { MailModule } from '../mail/mail.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrustDBSchema } from './schemas/trusts.schema';
import { TrustsService } from './trusts.service';
import { UserDBSchema } from '../users/schemas/users.schema';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Trust', schema: TrustDBSchema },
      { name: 'User', schema: UserDBSchema },
    ]),
    MailModule,
    UsersModule,
  ],
  providers: [
    TrustsService,
    TrustsResolver,
    HeirResolver,
    LegatorResolver,
    TrustExtendUserResolver,
    UsersService,
  ],
  exports: [TrustsService],
})
export class TrustsModule {}
