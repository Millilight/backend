import { Heir, Legator, User, UserDetails } from '@gqltypes';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}

  async sendUserConfirmation(user: User, signup_mail_token: string) {
    if (this.configService.get<string>('node_env') === 'development') return;
    const url = `${this.configService.get<string>(
      'baseUrls.front'
    )}/auth/confirmation?token=${signup_mail_token}&user_id=${user._id}`;
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

  async resetPassword(user: User, reset_password_token: string) {
    if (this.configService.get<string>('node_env') === 'development') return;
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/user/reinitialisation?token=${reset_password_token}&user_id=${user._id}`;

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

  async sendUserEmailUpdate(
    user: User,
    new_email: String,
    new_email_token: String
  ) {
    if (this.configService.get<string>('node_env') === 'development') return;
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/user/changementMail?token=${new_email_token}&user_id=${user._id}`;

    await this.mailerService.sendMail({
      to: new_email.toString(),
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

  async sendHeirNotification(legator_user: User, heir_user: User) {
    if (this.configService.get<string>('node_env') === 'development') return;
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/trust/notification`;

    await this.mailerService.sendMail({
      to: heir_user.email.toString(),
      // from: '"Support Team" <support@example.com>', // override default from
      subject: `${legator_user.firstname} ${legator_user.lastname} vous a ajouté comme personne de confiance`,
      template: __dirname + '/trustNotification', // `.hbs` extension is appended automatically
      context: {
        // filling curly brackets with content
        url,
        legator_user_firstname: legator_user.firstname,
        legator_user_lastname: legator_user.lastname,
        heir_user_firstname: heir_user.firstname,
        product_name: this.configService.get<string>('product_name'),
        home_url: this.configService.get<string>('base_urls.home'),
        front_url: this.configService.get<string>('base_urls.front'),
      },
    });
  }

  async sendHeirInvitation(
    legator_user: User,
    heir_user: User,
    signup_mail_token: string
  ) {
    if (this.configService.get<string>('node_env') === 'development') return;
    const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/auth/confirmation?token=${signup_mail_token}&user_id=${
      heir_user._id
    }&fromInvitation=true`;

    await this.mailerService.sendMail({
      to: heir_user.email.toString(),
      // from: '"Support Team" <support@example.com>', // override default from
      subject: `${legator_user.firstname} ${legator_user.lastname} vous a ajouté comme personne de confiance`,
      template: __dirname + '/trustInvitation', // `.hbs` extension is appended automatically
      context: {
        // filling curly brackets with content
        legator_user_firstname: legator_user.firstname,
        legator_user_lastname: legator_user.lastname,
        heir_user_firstname: heir_user.firstname,
        url,
        product_name: this.configService.get<string>('product_name'),
        home_url: this.configService.get<string>('base_urls.home'),
        front_url: this.configService.get<string>('base_urls.front'),
      },
    });
  }

  async sendUnlockedUrgentDataNotification(
    legator_user: Legator,
    legator_user_details: UserDetails,
    heir_user: Heir,
    heir_user_details: UserDetails
  ) {
    if (this.configService.get<string>('node_env') === 'development') return;
    /*const url = `${this.configService.get<string>(
      'base_urls.front'
    )}/user/deverouillageUrgent?token=${legator_user.signup_mail_token}&user_id=${
      legator_user._id
    }&fromInvitation=true`;*/
    await this.mailerService.sendMail({
      to: legator_user_details.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: `${heir_user_details.firstname} ${heir_user_details.lastname} demande l'accès à vos informations urgentes`,
      template: __dirname + '/unlockUrgent', // `.hbs` extension is appended automatically
      context: {
        // filling curly brackets with content
        legator_user_firstname: legator_user_details.firstname,
        //url,
        heir_user_firstname: heir_user_details.firstname,
        heir_user_lastname: heir_user_details.lastname,
        product_name: this.configService.get<string>('product_name'),
        home_url: this.configService.get<string>('base_urls.home'),
        front_url: this.configService.get<string>('base_urls.front'),
      },
    });
  }
}
