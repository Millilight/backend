import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { APP_GUARD } from '@nestjs/core';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { AuthModule } from './modules/auth/auth.module';
import { DateScalar } from './common/scalars/date.scalar';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrustsModule } from './modules/trusts/trusts.module';
import { UsersModule } from './modules/users/users.module';
import config from './config/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        typePaths: ['./**/*.graphql'],
        definitions: {
          path: join(process.cwd(), 'src/graphql.ts'),
          outputAs: 'class',
          emitTypenameField: true,
        },
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        introspection: configService.get<string>('node_env') !== 'production'
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TrustsModule,
  ],
  providers: [
    DateScalar,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
