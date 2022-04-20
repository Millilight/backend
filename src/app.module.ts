import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamicModule, Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { AuthModule } from './modules/auth/auth.module';
import { DateScalar } from './common/scalars/date.scalar';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { ProxyModule } from '@finastra/nestjs-proxy';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { TrustsModule } from './modules/trusts/trusts.module';
import { UsersModule } from './modules/users/users.module';
import { WishesModule } from './modules/wishes/wishes.module';
import config from './config/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    // TODO Voir si on peut faire créer un type pour lui
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    ProxyModule.forRoot({
      services: [
        {
          id: 'AMPLITUDE',
          url: 'https://api.amplitude.com',
          config: {
            headers: {
              'content-type': 'application/x-www-form-urlencoded',
            },
          },
        },
      ],
    }) as DynamicModule,
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
        introspection: configService.get<string>('node_env') !== 'production',
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
    WishesModule,
    ProceduresModule
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
