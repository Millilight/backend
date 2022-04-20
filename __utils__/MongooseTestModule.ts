import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { UserDB, UserDBSchema } from '../src/modules/users/schemas/user.schema';
import {
  WishesDB,
  WishesDBSchema,
} from '../src/modules/wishes/schemas/wishes.schema';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { ProceduresDBSchema } from '../src/modules/procedures/schemas/procedures.schema';
import mongoose from 'mongoose';

export class MongooseTestModule {
  private server: MongoMemoryServer;

  constructor() {
    this.server = null;
  }

  async start(options: MongooseModuleOptions = {}) {
    this.server = await MongoMemoryServer.create();
    const uri = await this.server.getUri();
    await mongoose.connect(uri);
    mongoose.model('User', UserDBSchema);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mongoose.model('Wishes', WishesDBSchema);
    mongoose.model('Procedures', ProceduresDBSchema);

    return MongooseModule.forRootAsync({
      useFactory: () => {
        return {
          uri: uri,
          ...options,
        };
      },
    });
  }

  async stop() {
    await mongoose.disconnect();
    await mongoose.connection.close();
    return this.server.stop();
  }

  cleanup() {
    return Promise.all(
      Object.entries(mongoose.models).map(([k, v]) => v.deleteMany({}))
    );
  }
}
