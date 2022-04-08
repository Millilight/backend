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

    await this.mailerService.sendMail({
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
    });
  }

  async sendUserEmailUpdate(user: User) {
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/user/changementMail?token=${user.new_email_token}&user_id=${user._id}`;

    await this.mailerService.sendMail({
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
    });
  }

  async sendTrustedUserNotification(legator_user: User, trusted_user: User) {
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/trust/notification`;

    await this.mailerService.sendMail({
      to: trusted_user.email.toString(),
      // from: '"Support Team" <support@example.com>', // override default from
      subject: `${legator_user.firstname} ${legator_user.lastname} vous a ajouté comme personne de confiance`,
      template: __dirname + '/trustNotification', // `.hbs` extension is appended automatically
      context: {
        // filling curly brackets with content
        url,
        legator_user_firstname: legator_user.firstname,
        legator_user_lastname: legator_user.lastname,
        trusted_user_firstname: trusted_user.firstname,
        product_name: this.configService.get<string>('product_name'),
        home_url: this.configService.get<string>('base_urls.home'),
        front_url: this.configService.get<string>('base_urls.front'),
      },
    });
  }

  async sendTrustedUserInvitation(legator_user: User, trusted_user: User) {
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/auth/confirmation?token=${trusted_user.signup_mail_token}&user_id=${
      trusted_user._id
    }&fromInvitation=true`;

    await this.mailerService.sendMail({
      to: trusted_user.email.toString(),
      // from: '"Support Team" <support@example.com>', // override default from
      subject: `${legator_user.firstname} ${legator_user.lastname} vous a ajouté comme personne de confiance`,
      template: __dirname + '/trustInvitation', // `.hbs` extension is appended automatically
      context: {
        // filling curly brackets with content
        legator_user_firstname: legator_user.firstname,
        legator_user_lastname: legator_user.lastname,
        trusted_user_firstname: trusted_user.firstname,
        url,
        product_name: this.configService.get<string>('product_name'),
        home_url: this.configService.get<string>('base_urls.home'),
        front_url: this.configService.get<string>('base_urls.front'),
      },
    });
  }

  async sendUnlockedUrgentDataNotification(
    legator_user: User,
    trusted_user: User
  ) {
    /*const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/user/deverouillageUrgent?token=${legator_user.signup_mail_token}&user_id=${
      legator_user._id
    }&fromInvitation=true`;*/
    await this.mailerService.sendMail({
      to: legator_user.email.toString(),
      // from: '"Support Team" <support@example.com>', // override default from
      subject: `${trusted_user.firstname} ${trusted_user.lastname} demande l'accès à vos informations urgentes`,
      template: __dirname + '/unlockUrgent', // `.hbs` extension is appended automatically
      context: {
        // filling curly brackets with content
        legator_user_firstname: legator_user.firstname,
        //url,
        trusted_user_firstname: trusted_user.firstname,
        trusted_user_lastname: trusted_user.lastname,
        product_name: this.configService.get<string>('product_name'),
        home_url: this.configService.get<string>('base_urls.home'),
        front_url: this.configService.get<string>('base_urls.front'),
      },
    });
  }
}
