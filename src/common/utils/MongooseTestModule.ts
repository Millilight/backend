import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { User, UserSchema } from '../../modules/users/schemas/user.schema';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const { MongoClient } = require('mongodb');

export class MongooseTestModule {
  private server: MongoMemoryServer;

  constructor() {
    this.server = null;
  }

  async start(options: MongooseModuleOptions = {}) {
    this.server = await MongoMemoryServer.create();
    const uri = await this.server.getUri();
    await mongoose.connect(uri);
    mongoose.model(User.name, UserSchema);

    return MongooseModule.forRootAsync({
      useFactory: async () => {
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
    return Promise.all(Object.entries(mongoose.models).map(([k, v]) => v.deleteMany({})));
  }

}