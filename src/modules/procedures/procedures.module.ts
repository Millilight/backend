import { ProceduresResolver, ProceduresUserResolver } from './procedures.resolver';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProceduresDBSchema } from './schemas/procedures.schema';
import { ProceduresService } from './procedures.service';
import { UserDBSchema } from '../users/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Procedures', schema: ProceduresDBSchema },
      { name: 'User', schema: UserDBSchema },
    ]),
  ],
  providers: [ProceduresService, ProceduresResolver, ProceduresUserResolver],
  exports: [ProceduresService],
})
export class ProceduresModule {}
