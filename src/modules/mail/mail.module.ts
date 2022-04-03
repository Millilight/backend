import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { join } from 'path';

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
                from: `L'équipe de ${configService.get<string>('product_name')} <support@${configService.get<string>('product_name')}.fr>`,
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
