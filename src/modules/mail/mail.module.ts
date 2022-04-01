import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
        useFactory: async (configService: ConfigService) => ({
            transport: {
                host: configService.get<string>('smtp.host'),
                secure: false,
                auth: {
                  user: configService.get<string>('smtp.user'),
                  pass: configService.get<string>('smtp.pass'),
                },
            },
            defaults: {
                from: `"No Reply" <${configService.get<string>('smtp.from')}>`, // TODO: use the right email
            },
            template: {
                dir: join(__dirname, 'templates'),
                adapter: new HandlebarsAdapter(),
                options: {
                  strict: true,
                },
            }
        }),
        inject: [ConfigService],
      }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
