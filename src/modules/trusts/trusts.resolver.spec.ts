import * as mocks_mail from '../../../__utils__/mocks.mail';
import * as mocks_trusts from '../../../__utils__/mocks.trusts';
import * as mocks_users from '../../../__utils__/mocks.users';

import { A_HEIR, A_HEIR_USER, A_LEGATOR_USER } from '../../../__utils__/consts';
import { Test, TestingModule } from '@nestjs/testing';

import { MailService } from '../mail/mail.service';
import { TrustsResolver } from './trusts.resolver';
import { TrustsService } from './trusts.service';
import { UsersService } from '../users/users.service';

describe('TrustsResolver', () => {
  let resolver: TrustsResolver;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrustsResolver,
        {
          provide: TrustsService,
          useFactory: () => ({
            addHeir: mocks_trusts.addHeir,
          }),
        },
        {
          provide: UsersService,
          useFactory: () => ({
            //create: mocks_trusts.create,
          }),
        },
        {
          provide: MailService,
          useFactory: () => ({
            sendUserConfirmation: mocks_mail.sendUserConfirmation,
          }),
        },
      ],
    }).compile();

    resolver = module.get<TrustsResolver>(TrustsResolver);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined before each', () => {
    expect(resolver).toBeDefined();
    expect(mailService).toBeDefined();
  });

  describe('addHeir', () => {
    it('should create a trust with an assigned heir', () => {
      const heir = resolver.addHeir({
        email: A_HEIR_USER.email,
        firstname: A_HEIR_USER.firstname,
        lastname: A_HEIR_USER.lastname,
      }, A_LEGATOR_USER);
      expect(heir).toEqual(A_HEIR);
    });
  });
});
