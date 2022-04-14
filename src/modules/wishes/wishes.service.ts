import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, Wishes } from '@gqltypes';
import { UpdateWishesDto } from './dto/update-wishes.dto';
import { WishesDocument } from './schemas/wishes.schema';
import { wishesDocToWishes } from '@/utils/parsers';

@Injectable()
export class WishesService {
  constructor(
    @InjectModel('Wishes') private wishesModel: Model<WishesDocument>
  ) {}

  private async findDocByUserIDOrCreate(
    user_id: string
  ): Promise<WishesDocument> {
    let wishes_db = await this.wishesModel.findOne({ user_id: user_id });
    if (!wishes_db)
      wishes_db = await this.wishesModel.create({ user_id: user_id });
    return wishes_db;
  }

  async findByUserIDOrCreate(user_id: string): Promise<Wishes> {
    return wishesDocToWishes(await this.findDocByUserIDOrCreate(user_id));
  }

  async update(
    user: User,
    update_wishes_dto: UpdateWishesDto
  ): Promise<Wishes> {
    const wishes_db = await this.findDocByUserIDOrCreate(user._id);
    Object.getOwnPropertyNames(update_wishes_dto).forEach((wish) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      wishes_db[wish] = update_wishes_dto[wish];
    });
    await wishes_db.save();
    return this.wishesModel.findOne({ user_id: user._id }); //.then(wishesDocToWishes);
  }
}
