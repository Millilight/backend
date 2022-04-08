import { Trust, TrustSchema } from './schemas/trusts.schema';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrustsResolver } from './trusts.resolver';
import { TrustsService } from './trusts.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trust.name, schema: TrustSchema }]),
  ],
  providers: [TrustsService, TrustsResolver],
  exports: [TrustsService],
})
export class TrustsModule {}
