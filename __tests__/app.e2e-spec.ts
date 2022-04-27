import * as configfile from '../src/config/config';
import * as request from 'supertest';

import {
  AN_ID,
  A_TOKEN,
  HASH_REGEX,
  REGEX_TOKEN,
} from '../__utils__/consts';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { StateTrust } from '../src/graphql';
import { UserDocument } from '../src/modules/users/schemas/users.schema';
import { getParameterFromUrl } from '../__utils__/utils';
import mongoose from 'mongoose';

// TODO : const { schema } = app.get(GraphQLSchemaHost);

const { mock } = require('nodemailer');
const mailServer = mock;

const GQL = '/graphql';

let mongod: MongoMemoryServer;
const config = configfile.default();

describe('GraphQL AppResolver (e2e) {Supertest}', () => {
  let app: INestApplication;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create({
      instance: { port: config.database.mongodb.port },
    });
    process.env.DATABASE_MONGODB_URI = mongod.getUri();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
    if (mongod) await mongod.stop();
    await app.close();
  });

  afterEach(async () => {
    mailServer.reset();
  });

  /* Tests all operations */
  describe(GQL, () => {
    describe('Users', () => {

      let signup_mail_token: string;
      let _id: string;
      let access_token: string;
      let security_code: string;
      let signup_mail_token_heir: string;
      let _id_heir: string;
      let access_token_heir: string;
      let _id_new_heir: string;
      let access_token_new_heir: string;
      let security_code_new_heir: string;
      let signup_mail_token_new_heir: string;
      let new_email_token: string;
      let reset_password_token: string;

      it('should signup a user and receive an email', async () => {
        return request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation CreateUser($firstname: String!, $lastname: String!, $email: String!, $password: String!) {
                createUser(
                  create_user_input: {firstname: $firstname, lastname: $lastname, email: $email, password: $password}
                ) {
                  email
                  _id
                  __typename
                  lastname
                  firstname
                  urgent_data {
                    user_id
                    wishes {
                      burial_cremation
                    }
                  }
                }
              }`,
            variables: {
              email: 'test@test.fr',
              lastname: 'TestLastname',
              firstname: 'TestFirstname',
              password: 'Test1234!',
            },
          })
          .expect(200)
          .expect((res) => {
            const newUser = res.body.data.createUser;
            expect(newUser.lastname).toEqual('TestLastname');
            expect(newUser.firstname).toEqual('TestFirstname');
            expect(newUser.email).toEqual('test@test.fr');
            expect(newUser._id).toBeDefined();
            expect(newUser.urgent_data.user_id).toBeDefined();
            expect(newUser.urgent_data.wishes.burial_cremation).toBeDefined();
            expect(newUser.__typename).toEqual('User');
            const mails_received = mailServer.getSentMail();
            expect(mails_received).toHaveLength(1);
            expect(mails_received[0].to).toEqual('test@test.fr');
            expect(mails_received[0].subject).toEqual(
              'Bienvenue sur amuni, confirmez votre email'
            );
            expect(mails_received[0].template).toContain(
              'src/modules/mail/confirmation'
            );

            signup_mail_token = getParameterFromUrl("token", mails_received[0].context.url);
            expect(signup_mail_token).toBeDefined();
            _id = getParameterFromUrl("user_id", mails_received[0].context.url);
            expect(_id).toBeDefined();
          });
      });

      it('should verify the user email', async () => {
        return request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation VerifyEmail($token: String!, $user_id: ID!) {
              verifyEmail(
                verify_email_input: { token: $token, user_id: $user_id }
              ) {
                success
              }
            }`,
            variables: {
              token: signup_mail_token,
              user_id: _id,
            },
          })
          .expect(200)
          .expect((res) => {
            const verifyEmail = res.body.data.verifyEmail;
            expect(verifyEmail.success).toEqual(true);
          });
      });

      it('should login the user', async () => {
        return request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation Login($email: String!, $password: String!) {
              login(
                login_user_input: { email: $email, password: $password }
              ) {
                access_token
                user {
                  _id
                  email
                  firstname
                  lastname
                }
              }
            }`,
            variables: {
              email: 'test@test.fr',
              password: 'Test1234!',
            },
          })
          .expect(200)
          .expect((res) => {
            access_token = res.body.data.login.access_token;
            expect(access_token).toBeDefined();
            const loginUser = res.body.data.login.user;
            expect(loginUser._id).toEqual(_id);
            expect(loginUser.email).toEqual('test@test.fr');
            expect(loginUser.firstname).toEqual('TestFirstname');
            expect(loginUser.lastname).toEqual('TestLastname');
          });
      });

      it('should update wishes', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            query: `mutation UpdateWishes($religion: String!) {
              updateWishes(
                update_wishes_input: { religion: $religion }
              ) {
                burial_cremation
                burial_cremation_place
                music
                religion
                place
                prevoyance
                list_of_people
                coffin
                ornament
                text
                other
              }
            }`,
            variables: {
              religion: 'test'
            },
          })
          .expect(200)
          .expect((res) => {
            const updatedWishes = res.body.data.updateWishes;
            expect(updatedWishes.burial_cremation).toEqual(null);
            expect(updatedWishes.burial_cremation_place).toEqual(null);
            expect(updatedWishes.music).toEqual(null);
            expect(updatedWishes.religion).toEqual("test");
            expect(updatedWishes.place).toEqual(null);
            expect(updatedWishes.prevoyance).toEqual(null);
            expect(updatedWishes.list_of_people).toEqual(null);
            expect(updatedWishes.coffin).toEqual(null);
            expect(updatedWishes.ornament).toEqual(null);
            expect(updatedWishes.text).toEqual(null);
            expect(updatedWishes.other).toEqual(null);
          });
      });

      it('should update procedures', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            query: `mutation UpdateProcedures($bank_products: [BankProductInput!]) {
              updateProcedures(
                update_procedures_input: { bank_products: $bank_products }
              ) {
                bank_products {
                  type
                  company
                  localization
                }
              }
            }`,
            variables: {
              bank_products: [{
                type: 'compte courant',
                company: 'Triodos',
                localization: 'Amsterdam'
              }]
            },
          })
          .expect(200)
          .expect((res) => {
            const updatedProcedures = res.body.data.updateProcedures;
            expect(updatedProcedures.bank_products).toEqual([{
              type: 'compte courant',
              company: 'Triodos',
              localization: 'Amsterdam'
            }]);
          });
      });

      it('should get the current user', async () => {
          return request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            query: `query User {
              user {
                _id
                email
                firstname
                lastname
                urgent_data {
                  user_id
                  wishes {
                    burial_cremation
                    burial_cremation_place
                    music
                    religion
                    place
                    prevoyance
                    list_of_people
                    coffin
                    ornament
                    text
                    other
                  }
                },
                sensitive_data {
                  user_id
                  procedures {
                    bank_products {
                      type
                      company
                      localization
                    },
                    insurance_products {
                      type
                      company
                      localization
                    }
                  }
                }
              }
            }`,
          })
          .expect(200)
          .expect((res) => {
            const getUser = res.body.data.user;
            expect(getUser._id).toEqual(_id);
            expect(getUser.email).toEqual('test@test.fr');
            expect(getUser.firstname).toEqual('TestFirstname');
            expect(getUser.lastname).toEqual('TestLastname');
            expect(getUser.urgent_data.user_id).toEqual(_id);
            expect(getUser.urgent_data.wishes).toEqual({
              burial_cremation: null,
              burial_cremation_place: null,
              coffin: null,
              list_of_people: null,
              music: null,
              ornament: null,
              other: null,
              place: null,
              prevoyance: null,
              religion: 'test',
              text: null
            });
            expect(getUser.sensitive_data).toEqual({
              user_id: _id,
              procedures: {
                bank_products: [{
                  type: 'compte courant',
                  company: 'Triodos',
                  localization: 'Amsterdam'
                }],
                insurance_products: []
              }
            });
          });
      });

      it('should signup a user, receive an email and verify it', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation CreateUser($firstname: String!, $lastname: String!, $email: String!, $password: String!) {
                createUser(
                  create_user_input: {firstname: $firstname, lastname: $lastname, email: $email, password: $password}
                ) {
                  email
                  _id
                  __typename
                  lastname
                  firstname
                  urgent_data {
                    user_id
                    wishes {
                      burial_cremation
                    }
                  }
                }
              }`,
            variables: {
              email: 'heir.test.lock@test.fr',
              lastname: 'HeirTestLastname',
              firstname: 'HeirTestFirstname',
              password: 'HeirTest1234!',
            },
          })
          .expect(200)
          .expect((res) => {
            const newUser = res.body.data.createUser;
            expect(newUser.lastname).toEqual('HeirTestLastname');
            expect(newUser.firstname).toEqual('HeirTestFirstname');
            expect(newUser.email).toEqual('heir.test.lock@test.fr');
            expect(newUser._id).toBeDefined();
            expect(newUser.urgent_data.user_id).toBeDefined();
            expect(newUser.urgent_data.wishes.burial_cremation).toBeDefined();
            expect(newUser.__typename).toEqual('User');
            const mails_received = mailServer.getSentMail();
            expect(mails_received).toHaveLength(1);
            expect(mails_received[0].to).toEqual('heir.test.lock@test.fr');
            expect(mails_received[0].subject).toEqual(
              'Bienvenue sur amuni, confirmez votre email'
            );
            expect(mails_received[0].template).toContain(
              'src/modules/mail/confirmation'
            );

            signup_mail_token_heir = getParameterFromUrl("token", mails_received[0].context.url);
            expect(signup_mail_token_heir).toBeDefined();
            _id_heir = getParameterFromUrl("user_id", mails_received[0].context.url);
            expect(_id_heir).toBeDefined();
          });

          await request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation VerifyEmail($token: String!, $user_id: ID!) {
              verifyEmail(
                verify_email_input: { token: $token, user_id: $user_id }
              ) {
                success
              }
            }`,
            variables: {
              token: signup_mail_token_heir,
              user_id: _id_heir,
            },
          })
          .expect(200)
          .expect((res) => {
            const verifyEmail = res.body.data.verifyEmail;
            expect(verifyEmail.success).toEqual(true);
          });

          return request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation Login($email: String!, $password: String!) {
              login(
                login_user_input: { email: $email, password: $password }
              ) {
                access_token
                user {
                  _id
                  email
                  firstname
                  lastname
                }
              }
            }`,
            variables: {
              email: 'heir.test.lock@test.fr',
              password: 'HeirTest1234!',
            },
          })
          .expect(200)
          .expect((res) => {
            access_token_heir = res.body.data.login.access_token;
            expect(access_token_heir).toBeDefined();
            const loginUser = res.body.data.login.user;
            expect(loginUser._id).toEqual(_id_heir);
            expect(loginUser.email).toEqual('heir.test.lock@test.fr');
            expect(loginUser.firstname).toEqual('HeirTestFirstname');
            expect(loginUser.lastname).toEqual('HeirTestLastname');
          });
      });

      it('should add a Heir', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            query: `mutation AddHeir($firstname: String!, $lastname: String!, $email: String!) {
              addHeir(
                add_heir_user_input: { firstname: $firstname, lastname: $lastname, email: $email }
                ) {
                heir_user {
                  _id
                  user_details {
                    email
                  }
                  security_code
                }
              }
            }`,
            variables: {
              firstname: "HeirTestFirstname",
              lastname: "HeirTestLastname",
              email: "heir.test.lock@test.fr"
            },
          })
          .expect(200)
          .expect((res) => {
            const heirUser = res.body.data.addHeir.heir_user;
            expect(heirUser._id).toEqual(_id_heir);
            expect(heirUser.user_details.email).toEqual('heir.test.lock@test.fr');
            security_code = heirUser.security_code;
            expect(security_code).toBeDefined();
            const mails_received = mailServer.getSentMail();
            expect(mails_received).toHaveLength(1);
            expect(mails_received[0].to).toEqual('heir.test.lock@test.fr');
            expect(mails_received[0].subject).toEqual(
              'TestFirstname TestLastname vous a ajouté comme personne de confiance'
            );
            expect(mails_received[0].template).toContain(
              'src/modules/mail/trustNotification'
            );
          });
      });

      it('should NOT add the same heir', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            query: `mutation AddHeir($firstname: String!, $lastname: String!, $email: String!) {
              addHeir(
                add_heir_user_input: { firstname: $firstname, lastname: $lastname, email: $email }
                ) {
                heir_user {
                  _id
                  user_details {
                    email
                  }
                  security_code
                }
              }
            }`,
            variables: {
              firstname: "HeirTestFirstname",
              lastname: "HeirTestLastname",
              email: "heir.test.lock@test.fr"
            },
          })
          .expect(409);
      });

      it('should give the heirs', async () => {
        return request(app.getHttpServer())
        .post(GQL)
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          query: `query User {
            user {
              heirs {
                user_details {
                  email
                  firstname
                  lastname
                }
              }
            }
          }`,
          variables: {
            _id_heir: _id_heir
          },
        })
        .expect(200)
        .expect((res) => {
          const heir = res.body.data.user.heirs[0];
          expect(heir.user_details.email).toEqual('heir.test.lock@test.fr');
          expect(heir.user_details.firstname).toEqual('HeirTestFirstname');
          expect(heir.user_details.lastname).toEqual('HeirTestLastname');
        });
      });

      it('should give nulled urgent data', async () => {
        return request(app.getHttpServer())
        .post(GQL)
        .set('Authorization', `Bearer ${access_token_heir}`)
        .send({
          query: `query User {
            user {
              legators {
                user_details {
                  email
                }
                urgent_data {
                  wishes {
                    religion
                  }
                }
              }
            }
          }`
        })
        .expect(200)
        .expect((res) => {
          const legator = res.body.data.user.legators[0];
          expect(legator.user_details.email).toEqual('test@test.fr');
          expect(legator.urgent_data).toEqual(null);
        });
      });

      it('should add a Heir with a non previously existing user', async () => {
        return request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            query: `mutation AddHeir($firstname: String!, $lastname: String!, $email: String!) {
              addHeir(
                add_heir_user_input: { firstname: $firstname, lastname: $lastname, email: $email }
                ) {
                heir_user {
                  _id
                  user_details {
                    email
                  }
                  security_code
                }
              }
            }`,
            variables: {
              firstname: "HeirTestFirstname",
              lastname: "HeirTestLastname",
              email: "new.heir.test@test.fr"
            },
          })
          .expect(200)
          .expect((res) => {
            const heirUser = res.body.data.addHeir.heir_user;
            _id_new_heir = heirUser._id;
            expect(_id_new_heir).toBeDefined();
            expect(heirUser.user_details.email).toEqual('new.heir.test@test.fr');
            security_code_new_heir = heirUser.security_code;
            expect(security_code_new_heir).toBeDefined();
            const mails_received = mailServer.getSentMail();
            expect(mails_received).toHaveLength(1);
            expect(mails_received[0].to).toEqual('new.heir.test@test.fr');
            expect(mails_received[0].subject).toEqual(
              'TestFirstname TestLastname vous a ajouté comme personne de confiance'
            );
            expect(mails_received[0].template).toContain(
              'src/modules/mail/trustInvitation'
            );
            signup_mail_token_new_heir = getParameterFromUrl('token', mails_received[0].context.url);
            expect(getParameterFromUrl('user_id', mails_received[0].context.url)).toEqual(_id_new_heir);
          });
      });

      it('should verify the email and update the password of the new user', async () => {
        return request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation VerifyEmailWithInvitation($user_id: ID!, $token: String!, $password: String!) {
              verifyEmailWithInvitation(
                verify_email_with_invitation_input: { user_id: $user_id, token: $token, password: $password }
                ) {
                success
              }
            }`,
            variables: {
              user_id: _id_new_heir,
              token: signup_mail_token_new_heir,
              password: "Test1234!"
            },
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.verifyEmailWithInvitation.success).toEqual(true);
          });
      });

      it('should confirm the security code', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation Login($email: String!, $password: String!) {
              login(
                login_user_input: { email: $email, password: $password }
              ) {
                access_token
                user {
                  _id
                  email
                  firstname
                  lastname
                }
              }
            }`,
            variables: {
              email: 'new.heir.test@test.fr',
              password: 'Test1234!',
            },
          })
          .expect(200)
          .expect((res) => {
            access_token_new_heir = res.body.data.login.access_token;
            expect(access_token_new_heir).toBeDefined();
            const loginUser = res.body.data.login.user;
            expect(loginUser._id).toEqual(_id_new_heir);
            expect(loginUser.email).toEqual('new.heir.test@test.fr');
            expect(loginUser.firstname).toEqual('HeirTestFirstname');
            expect(loginUser.lastname).toEqual('HeirTestLastname');
          });

        return request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token_new_heir}`)
          .send({
            query: `mutation ConfirmSecurityCode($legator_user_id: ID!, $security_code: String!) {
              confirmSecurityCode(
                confirm_security_code_input: { legator_user_id: $legator_user_id, security_code: $security_code }
                ) {
                legator_user {
                  _id
                  user_details {
                    email
                    firstname
                    lastname
                  }
                  state
                  urgent_data_unlocked
                }
              }
            }`,
            variables: {
              legator_user_id: _id,
              security_code: security_code_new_heir
            },
          })
          .expect(200)
          .expect((res) => {
            const legator_user = res.body.data.confirmSecurityCode.legator_user;
            expect(legator_user._id).toEqual(_id);
            expect(legator_user.user_details.email).toEqual('test@test.fr');
            expect(legator_user.user_details.firstname).toEqual('TestFirstname');
            expect(legator_user.user_details.lastname).toEqual('TestLastname');
            expect(legator_user.state).toEqual(StateTrust.VALIDATED);
            expect(legator_user.urgent_data_unlocked).toEqual(false);
          });
      });

      it('should unlock legator urgent data', async () => {
        return request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token_new_heir}`)
          .send({
            query: `mutation UnlockUrgentData($legator_user_id: ID!) {
              unlockUrgentData(
                unlock_urgent_data_input: { legator_user_id: $legator_user_id }
                ) {
                success
              }
            }`,
            variables: {
              legator_user_id: _id
            },
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.unlockUrgentData.success).toEqual(true);
          });
      });

      it('should give legator urgent data', async () => {
        return request(app.getHttpServer())
        .post(GQL)
        .set('Authorization', `Bearer ${access_token_new_heir}`)
        .send({
          query: `query User {
            user {
              legators {
                user_details {
                  email
                }
                urgent_data {
                  wishes {
                    burial_cremation
                    burial_cremation_place
                    music
                    religion
                    place
                    prevoyance
                    list_of_people
                    coffin
                    ornament
                    text
                    other
                  }
                }
              }
            }
          }`
        })
        .expect(200)
        .expect((res) => {
          const legator = res.body.data.user.legators[0];
          expect(legator.user_details.email).toEqual('test@test.fr');
          expect(legator.urgent_data.wishes.burial_cremation).toEqual(null);
          expect(legator.urgent_data.wishes.burial_cremation_place).toEqual(null);
          expect(legator.urgent_data.wishes.music).toEqual(null);
          expect(legator.urgent_data.wishes.religion).toEqual('test');
          expect(legator.urgent_data.wishes.place).toEqual(null);
          expect(legator.urgent_data.wishes.prevoyance).toEqual(null);
          expect(legator.urgent_data.wishes.list_of_people).toEqual(null);
          expect(legator.urgent_data.wishes.coffin).toEqual(null);
          expect(legator.urgent_data.wishes.ornament).toEqual(null);
          expect(legator.urgent_data.wishes.text).toEqual(null);
          expect(legator.urgent_data.wishes.other).toEqual(null);
        });
      });

      it('should accepts the request to change the password', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation AskResetPasswordUser($email: String!) {
              askResetPasswordUser(
                ask_reset_password_user_input: { email: $email }
                ) {
                success
              }
            }`,
            variables: {
              email: 'test@test.fr',
            },
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.data.askResetPasswordUser.success).toEqual(true);
            const mails_received = mailServer.getSentMail();
            expect(mails_received).toHaveLength(1);
            expect(mails_received[0].to).toEqual('test@test.fr');
            expect(mails_received[0].subject).toEqual(
              'Merci de votre confiance'
            );
            expect(mails_received[0].template).toContain(
              'src/modules/mail/resetPassword'
            );
            reset_password_token = getParameterFromUrl('token', mails_received[0].context.url);
            expect(reset_password_token).toBeDefined();
            expect(getParameterFromUrl('user_id', mails_received[0].context.url)).toEqual(_id);
          });
      });

      it('should update the forgotten password', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation ResetPasswordUser($new_password: String!, $token: String!, $user_id: ID!) {
              resetPasswordUser(
                reset_password_user_input: { new_password: $new_password, token: $token, user_id: $user_id }
                ) {
                _id
                email
                firstname
                lastname
              }
            }`,
            variables: {
              new_password: 'changeTest1234!',
              token: reset_password_token,
              user_id: _id
            },
          })
          .expect(200)
          .expect((res) => {
            const updatedUser = res.body.data.resetPasswordUser;
            expect(updatedUser._id).toEqual(_id);
            expect(updatedUser.email).toEqual('test@test.fr');
            expect(updatedUser.firstname).toEqual('TestFirstname');
            expect(updatedUser.lastname).toEqual('TestLastname');
          });
      });

      it('should update the user', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .set('Authorization', `Bearer ${access_token}`)
          .send({
            query: `mutation UpdateUser($new_email: String!, $firstname: String!, $lastname: String!, $password: String!) {
              updateUser(
                update_user_input: { new_email: $new_email, firstname: $firstname, lastname: $lastname, password: $password }
              ) {
                _id
                email
                firstname
                lastname
              }
            }`,
            variables: {
              firstname : 'ChangeTestFirstname',
              lastname : 'ChangeTestLastname',
              new_email: 'changetest@test.fr',
              password: 'changeTest1234!'
            },
          })
          .expect(200)
          .expect((res) => {
            const updatedUser = res.body.data.updateUser;
            expect(updatedUser._id).toEqual(_id);
            expect(updatedUser.email).toEqual('test@test.fr');
            expect(updatedUser.firstname).toEqual('ChangeTestFirstname');
            expect(updatedUser.lastname).toEqual('ChangeTestLastname');
            const mails_received = mailServer.getSentMail();
            expect(mails_received).toHaveLength(1);
            expect(mails_received[0].to).toEqual('changetest@test.fr');
            expect(mails_received[0].subject).toEqual(
              'Merci de votre confiance'
            );
            expect(mails_received[0].template).toContain(
              'src/modules/mail/updateMail'
            );
            new_email_token = getParameterFromUrl('token', mails_received[0].context.url);
            expect(new_email_token).toBeDefined();
            expect(getParameterFromUrl('user_id', mails_received[0].context.url)).toEqual(_id);
          });
      });

      it('should verify the new email', async () => {
        await request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation VerifyNewEmail($token: String!, $user_id: ID!) {
              verifyNewEmail(
                verify_new_email_input: { token: $token, user_id: $user_id }
                ) {
                _id
                email
                firstname
                lastname
              }
            }`,
            variables: {
              token: new_email_token,
              user_id: _id
            },
          })
          .expect(200)
          .expect((res) => {
            const updatedUser = res.body.data.verifyNewEmail;
            expect(updatedUser._id).toEqual(_id);
            expect(updatedUser.email).toEqual('changetest@test.fr');
            expect(updatedUser.firstname).toEqual('ChangeTestFirstname');
            expect(updatedUser.lastname).toEqual('ChangeTestLastname');
          });
      });
    });
  });
});
