import {
  Args,
  Mutation,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { UrgentData, User, Wishes } from '@gqltypes';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { UpdateWishesDto } from './dto/update-wishes.dto';
import { CurrentUser } from '../users/users.decorator';

@Resolver(Wishes)
@UseFilters(MongoExceptionFilter)
export class WishesResolver {
  constructor(private wishesService: WishesService) {}

  @Mutation()
  async updateWishes(
    @CurrentUser() user: User,
    @Args('update_wishes_input') update_wishes_dto: UpdateWishesDto
  ): Promise<Wishes> {
    return await this.wishesService.update(user, update_wishes_dto);
  }
}

@Resolver(UrgentData)
@UseFilters(MongoExceptionFilter)
export class WishesUserResolver {
  constructor(private wishesService: WishesService) {}

  @ResolveField()
  async wishes(@Parent() urgent_data: UrgentData): Promise<Wishes> {
    return this.wishesService.findByUserIDOrCreate(urgent_data.user_id);
  }
}
