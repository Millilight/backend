import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserDBSchema, UserDocument } from './schemas/user.schema';

import { Fixtures } from '../../../__utils__/fixtures';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseTestModule } from '../../../__utils__/MongooseTestModule';
import { UsersService } from './users.service';
import mongoose from 'mongoose';
import { userDocToUser } from '@/utils/parsers';

const HASH_REGEX = /^\$2[ayb]\$.{56}$/;
const REGEX_TOKEN = /^[a-zA-Z0-9]{32}$/;
const AN_ID = '000000000000000000000000';
const A_TOKEN = '123456789ABCDEFHIJKLMNOPQRSTabcd';

describe('UserService', () => {
  const db = new MongooseTestModule();
  let service: UsersService;
  let fixtures: Fixtures;

  afterAll(() => db.stop());
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await db.start(),
        MongooseModule.forFeature([{ name: 'User', schema: UserDBSchema }]),
      ],
      providers: [UsersService],
    }).compile();
    fixtures = new Fixtures();
    service = module.get<UsersService>(UsersService);
  });
  afterEach(() => db.cleanup());

  it('should be defined: fixtures and service', () => {
    expect(fixtures).toBeDefined();
    expect(service).toBeDefined();
  });

  /* Tests all services*/
  describe('create', () => {
    it('should return a new user', async () => {
      return service
        .create({
          lastname: 'TestLastname',
          firstname: 'TestFirstname',
          email: 'test@test.fr',
          password: 'Test1234@',
        })
        .then(async (user) => {
          expect(user._id).toBeDefined();
          expect(user.lastname).toEqual('TestLastname');
          expect(user.firstname).toEqual('TestFirstname');
          expect(user.email).toEqual('test@test.fr');

          //And in db
          const user_doc = await mongoose.models.UserDB.findOne<UserDocument>({
            _id: user._id,
          })
            .select('+password')
            .exec();
          expect(user_doc._id).toEqual(user._id);
          expect(user_doc.lastname).toEqual('TestLastname');
          expect(user_doc.firstname).toEqual('TestFirstname');
          expect(user_doc.email).toEqual('test@test.fr');
          expect(user_doc.password).toMatch(HASH_REGEX);
        });
    });

    it('should throw error if email already used', async () => {
      await fixtures.addUser();
      return expect(
        service.create({
          lastname: 'TestLastname',
          firstname: 'TestFirstname',
          email: 'test@test.fr',
          password: 'Test1234@',
        })
      ).rejects.toThrowError(new ConflictException('Email already registered'));
    });
  });

  describe('getWithAuth', () => {
    it('should return the user', async () => {
      await fixtures.addUser();
      return service.getWithAuth('test@test.fr', 'Test1234@').then((user) => {
        expect(user._id).toBeDefined();
        expect(user.email).toEqual('test@test.fr');
        expect(user.lastname).toEqual('TestLastname');
        expect(user.firstname).toEqual('TestFirstname');
      });
    });

    it('should return NotFoundException because of wrong email', () => {
      return expect(
        service.getWithAuth('notfound@test.fr', 'Test1234@')
      ).rejects.toThrowError(new NotFoundException('User not found'));
    });

    it('should return NotFoundException because of wrong password', async () => {
      await fixtures.addUser();
      return expect(
        service.getWithAuth('test@test.fr', 'Wrong')
      ).rejects.toThrowError(new NotFoundException('User not found'));
    });
  });

  describe('findByID', () => {
    it('should return the user', async () => {
      const user = await fixtures.addUser();
      return service.findByID(user._id as string).then((user_doc) => {
        expect(user_doc._id).toBeDefined();
        expect(user_doc.email).toEqual('test@test.fr');
      });
    });

    it('should return NotFoundException', () => {
      return expect(service.findByID(AN_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return the user', async () => {
      await fixtures.addUser();
      return service.findByEmail('test@test.fr').then((user) => {
        expect(user._id).toBeDefined();
        expect(user.email).toEqual('test@test.fr');
      });
    });

    it('should return NotFoundException', () => {
      return expect(
        service.findByEmail('notfound@test.fr')
      ).rejects.toThrowError(new NotFoundException('User not found'));
    });
  });

  describe('getNewEmailAndToken', () => {
    it('should get the new email and the new email_token', async () => {
      const user_fixture = await fixtures.addUser().then(userDocToUser);

      await service.update(user_fixture, {
        new_email: 'new_email@test.fr',
      });

      const { new_email, new_email_token } =
        await mongoose.models.UserDB.findOne<UserDocument>({
          _id: user_fixture._id,
        })
          .select('+new_email +new_email_token')
          .exec();

      return service.getNewEmailAndToken(user_fixture._id).then((data) => {
        expect(data.new_email).toEqual(new_email);
        expect(data.new_email_token).toEqual(new_email_token);
      });
    });

    it("should throw error if the user didn't modify email", async () => {
      const user_fixture = await fixtures.addUser().then(userDocToUser);
      return expect(
        service.getNewEmailAndToken(user_fixture._id)
      ).rejects.toThrowError(
        new ConflictException("User didn't ask for an email change")
      );
    });

    it('should throw error if user not found', () => {
      return expect(service.getNewEmailAndToken(AN_ID)).rejects.toThrowError(
        new NotFoundException('User not found')
      );
    });
  });

  describe('getSignupMailToken', () => {
    it('should return the signup mail token', async () => {
      const user = await service.create({
        firstname: 'Firstname',
        lastname: 'Lastname',
        email: 'test@test.fr',
        password: 'test',
      });
      const { signup_mail_token } =
        await mongoose.models.UserDB.findOne<UserDocument>({
          _id: user._id,
        })
          .select('+signup_mail_token')
          .exec();
      expect(signup_mail_token).toBeDefined();

      return service
        .getSignupMailToken(user._id)
        .then((signup_mail_token_found) => {
          expect(signup_mail_token_found).toEqual(signup_mail_token);
        });
    });

    it('should throw user not found', () => {
      return expect(service.getSignupMailToken(AN_ID)).rejects.toThrowError(
        new NotFoundException('User not found')
      );
    });

    it('should throw email already verified', async () => {
      const user_doc_fixture = await fixtures.addUser();
      return expect(
        service.getSignupMailToken(user_doc_fixture._id as string)
      ).rejects.toThrowError(new ConflictException('Email already verified'));
    });
  });

  describe('update', () => {
    it('should return the user with simple fields updated', async () => {
      const user_fixture = await fixtures.addUser().then(userDocToUser);

      return service
        .update(user_fixture, {
          firstname: 'NewFirstname',
          lastname: 'NewLastname',
          password: 'NewPassword',
        })
        .then((user) => {
          expect(user._id).toBeDefined();
          expect(user.email).toEqual('test@test.fr');
          expect(user.lastname).toEqual('NewLastname');
          expect(user.firstname).toEqual('NewFirstname');
        });
    });

    it('should change password and delete reset password', async () => {
      const user_fixture = await fixtures.addUser().then(userDocToUser);
      await service.askResetPassword({ email: user_fixture.email });

      const previous_user = await mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_fixture._id,
      })
        .select('+password +reset_password_token')
        .exec();
      const previous_hash = previous_user.password;
      expect(previous_user.reset_password_token).toMatch(REGEX_TOKEN);

      await service.update(user_fixture, {
        password: 'NewPassword',
      });

      return mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_fixture._id,
      })
        .select('+password +reset_password_token')
        .exec()
        .then((user_doc) => {
          expect(user_doc.password).toMatch(HASH_REGEX);
          expect(user_doc.password).not.toEqual(previous_hash);
          expect(user_doc.reset_password_token).toBeUndefined();
        });
    });

    it('should return the user with new email updated', async () => {
      const user_doc_fixture = await fixtures.addUser();

      //In DB
      await mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_doc_fixture._id as string,
      })
        .select('+new_email +new_email_token')
        .exec()
        .then((user_doc) => {
          expect(user_doc.new_email).toBeUndefined();
          expect(user_doc.new_email_token).toBeUndefined();
        });

      const user_fixture = userDocToUser(user_doc_fixture);
      expect(user_doc_fixture.email).toEqual('test@test.fr');
      expect(user_doc_fixture.lastname).toEqual('TestLastname');
      expect(user_doc_fixture.firstname).toEqual('TestFirstname');

      await service
        .update(user_fixture, { new_email: 'new_email@test.fr' })
        .then((user_updated) => {
          expect(user_updated._id).toBeDefined();
          expect(user_updated.email).toEqual('test@test.fr');
          expect(user_updated.lastname).toEqual('TestLastname');
          expect(user_updated.firstname).toEqual('TestFirstname');
        });

      // In DB
      return mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_fixture._id,
      })
        .select('+new_email +new_email_token')
        .exec()
        .then((user_doc) => {
          expect(user_doc.lastname).toEqual('TestLastname');
          expect(user_doc.firstname).toEqual('TestFirstname');
          expect(user_doc.email).toEqual('test@test.fr');
          expect(user_doc.new_email).toEqual('new_email@test.fr');
          expect(user_doc.new_email_token).toMatch(REGEX_TOKEN);
        });
    });

    it('should return NotFoundException', async () => {
      await expect(
        service.update(
          {
            _id: AN_ID,
            email: 'notfound@test.fr',
            lastname: 'not',
            firstname: 'found',
            heirs: undefined,
            legators: undefined,
            urgent_data: undefined,
          },
          { firstname: 'Newfirstname' }
        )
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyNewEmail', () => {
    it('should verify the new email', async () => {
      const user_fixture = await fixtures.addUser().then(userDocToUser);

      await service.update(user_fixture, {
        new_email: 'new_email@test.fr',
      });

      const user_doc = await mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_fixture._id,
      })
        .select('+new_email_token')
        .exec();

      await service
        .verifyNewEmail(user_fixture, user_doc.new_email_token)
        .then((user) => {
          expect(user.email).toEqual('new_email@test.fr');
        });

      return mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_fixture._id,
      })
        .select('+new_email +new_email_token')
        .exec()
        .then((user_doc) => {
          expect(user_doc.email).toEqual('new_email@test.fr');
          expect(user_doc.new_email).toBeUndefined();
          expect(user_doc.new_email_token).toBeUndefined();
        });
    });

    it('should throw error when not found user', () => {
      return expect(
        service.verifyNewEmail(
          {
            _id: AN_ID,
            lastname: 'TestLastname',
            firstname: 'TestFirstname',
            email: 'test@test.fr',
            heirs: undefined,
            legators: undefined,
            urgent_data: undefined,
          },
          A_TOKEN
        )
      ).rejects.toThrowError(new NotFoundException('User not found'));
    });

    it('should throw error when not found user and did not ask to modify email', async () => {
      const user_fixture = await fixtures.addUser().then(userDocToUser);
      return expect(
        service.verifyNewEmail(user_fixture, 'WrongToken!')
      ).rejects.toThrowError(new ConflictException('Wrong token'));
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email', async () => {
      const user = await service.create({
        lastname: 'TestLastname',
        firstname: 'TestFirstname',
        email: 'test@test.fr',
        password: 'Test1234@',
      });

      const user_doc = await mongoose.models.UserDB.findOne<UserDocument>({
        _id: user._id,
      })
        .select('+signup_mail_token +mail_verified')
        .exec();

      expect(user_doc.signup_mail_token).toBeDefined();
      expect(user_doc.mail_verified).toEqual(false);

      await service.verifyEmail({
        user_id: user._id,
        token: user_doc.signup_mail_token,
      });

      return mongoose.models.UserDB.findOne<UserDocument>({
        _id: user._id,
      })
        .select('+signup_mail_token +mail_verified')
        .exec()
        .then((user_doc) => {
          expect(user_doc.signup_mail_token).toBeUndefined();
          expect(user_doc.mail_verified).toEqual(true);
        });
    });

    it('should throw user not found', () => {
      return expect(
        service.verifyEmail({
          user_id: AN_ID,
          token: A_TOKEN,
        })
      ).rejects.toThrowError(new NotFoundException('User not found'));
    });

    it('should throw user already verified', async () => {
      const user = await fixtures.addUser();
      return expect(
        service.verifyEmail({
          user_id: user._id as string,
          token: A_TOKEN,
        })
      ).rejects.toThrowError(new ConflictException('Email already verified'));
    });

    it('should throw wrong token', async () => {
      const user_doc_fixture = await fixtures.addUser();
      const user_doc = await mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_doc_fixture._id as string,
      }).exec();

      user_doc.signup_mail_token = A_TOKEN;
      user_doc.mail_verified = false;
      await user_doc.save();

      await service.verifyEmail({
        user_id: user_doc._id as string,
        token: user_doc.signup_mail_token,
      });

      return mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_doc._id as string,
      })
        .select('+signup_mail_token +mail_verified')
        .exec()
        .then((user_doc) => {
          expect(user_doc.signup_mail_token).toBeUndefined();
          expect(user_doc.mail_verified).toEqual(true);
        });
    });
  });

  describe('askResetPassword', () => {
    it('should create reset password token', async () => {
      const user_doc_fixture = await fixtures.addUser();
      const user_doc = await mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_doc_fixture._id as string,
      }).exec();
      expect(user_doc.reset_password_token).toBeUndefined();

      const { reset_password_token } = await service.askResetPassword({
        email: user_doc_fixture.email,
      });
      expect(reset_password_token).toMatch(REGEX_TOKEN);

      return service
        .askResetPassword({
          email: user_doc_fixture.email,
        })
        .then((data) => {
          expect(data.user._id).toEqual(user_doc._id);
          expect(data.reset_password_token).toMatch(REGEX_TOKEN);
          expect(data.reset_password_token).not.toEqual(reset_password_token);
        });
    });

    it('should throw user not found', () => {
      return expect(
        service.askResetPassword({ email: 'notfound@test.fr' })
      ).rejects.toThrowError(new NotFoundException('User not found'));
    });
  });

  describe('verifyTokenAndResetPassword', () => {
    it('should verify the token and change the password', async () => {
      const user_doc_fixture = await fixtures.addUser();

      const user_doc = await mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_doc_fixture._id as string,
      }).exec();

      const previous_password = user_doc.password;

      user_doc.reset_password_token = A_TOKEN;
      await user_doc.save();

      await service.verifyTokenAndResetPassword({
        user_id: user_doc_fixture._id as string,
        token: A_TOKEN,
        new_password: 'NewPassword',
      });

      return mongoose.models.UserDB.findOne<UserDocument>({
        _id: user_doc_fixture._id as string,
      })
        .select('+password +reset_password_token')
        .exec()
        .then((user_doc) => {
          expect(user_doc.reset_password_token).toBeUndefined();
          expect(user_doc.password).toMatch(HASH_REGEX);
          expect(user_doc.password).not.toEqual(previous_password);
        });
    });

    it('should throw user not found', async () => {
      return expect(
        service.verifyTokenAndResetPassword({
          user_id: AN_ID,
          token: A_TOKEN,
          new_password: 'NewPassword',
        })
      ).rejects.toThrowError(new NotFoundException('User not found'));
    });

    it('should throw error if wrong token', async () => {
      const user_doc_fixture = await fixtures.addUser();

      return expect(
        service.verifyTokenAndResetPassword({
          user_id: user_doc_fixture._id as string,
          token: A_TOKEN,
          new_password: 'NewPassword',
        })
      ).rejects.toThrowError(new ConflictException('Wrong token'));
    });
  });

  describe('userDetailsByID', () => {
    it('should return the user details', async () => {
      const user_doc = await fixtures.addUser();
      return service.userDetailsByID(user_doc._id as string).then((details) => {
        expect(details).toEqual({
          email: user_doc.email,
          firstname: user_doc.firstname,
          lastname: user_doc.lastname,
        });
      });
    });

    it('should throw user not found', async () => {
      return expect(service.userDetailsByID(AN_ID)).rejects.toThrowError(
        new NotFoundException('User not found')
      );
    });
  });
});
