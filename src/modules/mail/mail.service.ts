import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService, private configService : ConfigService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `${this.configService.get<string>('baseUrls.front')}/auth/confirmation?token=${token}&user_id=${user._id}`;

    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to Nice App! Confirm your Email',
      template: __dirname + '/confirmation', // `.hbs` extension is appended automatically
      context: { // filling curly brackets with content
        name: user.firstname,
        url,
      },
    });
  }
}
