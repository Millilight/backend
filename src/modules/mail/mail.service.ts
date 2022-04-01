import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}

  async sendUserConfirmation(user: User) {
    const url = `${this.configService.get<string>(
      'baseUrls.front'
    )}/auth/confirmation?token=${user.signup_mail_token}&user_id=${user._id}`;
    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: `Bienvenue sur ${this.configService.get<string>(
        'product_name'
      )}, confirmez votre email`,
      template: __dirname + '/confirmation', // `.hbs` extension is appended automatically
      context: {
        // filling curly brackets with content
        firstname: user.firstname,
        url,
        email: user.email,
        product_name: this.configService.get<string>('product_name'),
        home_url: this.configService.get<string>('base_urls.home'),
        front_url: this.configService.get<string>('base_urls.front'),
      },
    });
  }

  async resetPassword(user: User) {
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/user/reinitialisation?token=${user.reset_password_token}&user_id=${
      user._id
    }`;

    await this.mailerService
      .sendMail({
        to: user.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Merci de votre confiance',
        template: __dirname + '/resetPassword', // `.hbs` extension is appended automatically
        context: {
          // filling curly brackets with content
          firstname: user.firstname,
          url,
          email: user.email,
          product_name: this.configService.get<string>('product_name'),
          home_url: this.configService.get<string>('base_urls.home'),
          front_url: this.configService.get<string>('base_urls.front'),
        },
      })
      .catch((err) => {
        throw err;
      });
  }

  async sendUserEmailUpdate(user: User) {
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/user/changementMail?token=${user.new_email_token}&user_id=${user._id}`;

    await this.mailerService
      .sendMail({
        to: user.new_email.toString(),
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Merci de votre confiance',
        template: __dirname + '/updateMail', // `.hbs` extension is appended automatically
        context: {
          // filling curly brackets with content
          firstname: user.firstname,
          url,
          email: user.email,
          product_name: this.configService.get<string>('product_name'),
          home_url: this.configService.get<string>('base_urls.home'),
          front_url: this.configService.get<string>('base_urls.front'),
        },
      })
      .catch((err) => {
        throw err;
      });
  }
}
