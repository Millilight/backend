import { WishesResolver, WishesUserResolver } from './wishes.resolver';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDBSchema } from '../users/schemas/users.schema';
import { WishesDBSchema } from './schemas/wishes.schema';
import { WishesService } from './wishes.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Wishes', schema: WishesDBSchema },
      { name: 'User', schema: UserDBSchema },
    ]),
  ],
  providers: [WishesService, WishesResolver, WishesUserResolver],
  exports: [WishesService],
})
export class WishesModule {}
