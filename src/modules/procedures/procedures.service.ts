import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, Procedures } from '@gqltypes';
import { UpdateProceduresDto } from './dto/update-procedures.dto';
import { proceduresDocToProcedures } from '@/utils/parsers';
import { ProceduresDocument } from './schemas/procedures.schema';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectModel('Procedures') private proceduresModel: Model<ProceduresDocument>
  ) {}

  private async findDocByUserIDOrCreate(
    user_id: string
  ): Promise<ProceduresDocument> {
    let procedures_db = await this.proceduresModel.findOne({ user_id: user_id });
    if (!procedures_db)
      procedures_db = await this.proceduresModel.create({ user_id: user_id });
    return procedures_db;
  }

  async findByUserID(user_id: string): Promise<Procedures> {
    return proceduresDocToProcedures(await this.findDocByUserIDOrCreate(user_id));
  }

  async update(
    user: User,
    update_procedures_dto: UpdateProceduresDto
  ): Promise<Procedures> {
    const procedures_db = await this.findDocByUserIDOrCreate(user._id);
    Object.getOwnPropertyNames(update_procedures_dto).forEach((procedure) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      procedures_db[procedure] = update_procedures_dto[procedure];
    });
    await procedures_db.save();
    return this.proceduresModel
      .findOne({ user_id: user._id })
      .then(proceduresDocToProcedures);
  }
}
