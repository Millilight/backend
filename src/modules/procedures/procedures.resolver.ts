import {
  Args,
  Mutation,
  Resolver,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseFilters } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { User, Procedures, SensitiveData } from '@gqltypes';
import { MongoExceptionFilter } from '@/utils/exception.filter';
import { UpdateProceduresDto } from './dto/update-procedures.dto';
import { CurrentUser } from '../users/users.decorator';

@Resolver(Procedures)
@UseFilters(MongoExceptionFilter)
export class ProceduresResolver {
  constructor(private proceduresService: ProceduresService) {}

  @Mutation()
  async updateProcedures(
    @CurrentUser() user: User,
    @Args('update_procedures_input') update_procedures_dto: UpdateProceduresDto
  ): Promise<Procedures> {
    return await this.proceduresService.update(user, update_procedures_dto);
  }
}

@Resolver(SensitiveData)
@UseFilters(MongoExceptionFilter)
export class ProceduresUserResolver {
  constructor(private proceduresService: ProceduresService) {}

  @ResolveField()
  async procedures(@Parent() sensitive_data: SensitiveData): Promise<Procedures> {
    return this.proceduresService.findByUserID(sensitive_data.user_id);
  }
}
