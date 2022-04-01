import * as configfile from '../src/config/config';
import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

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

  describe(GQL, () => {
    describe('Users', () => {
      it('should create a user and receive a mail', () => {
        return request(app.getHttpServer())
          .post(GQL)
          .send({
            query: `mutation CreateUser($firstname: String!, $lastname: String!, $email: String!, $password: String!) {
                createUser(
                  create_user_dto: {firstname: $firstname, lastname: $lastname, email: $email, password: $password}
                ) {
                  email
                  _id
                  __typename
                  lastname
                  firstname
                  wishes {
                    burial_cremation
                  }
                }
              }`,
            variables: {
              email: 'test@test.fr',
              lastname: 'TestLastname',
              firstname: 'TestFirstName',
              password: 'Test1234!',
            },
          })
          .expect(200)
          .expect((res) => {
            const newUser = res.body.data.createUser;
            expect(newUser.lastname).toEqual('TestLastname');
            expect(newUser.firstname).toEqual('TestFirstName');
            expect(newUser.email).toEqual('test@test.fr');
            expect(newUser._id).toBeDefined();
            expect(newUser.wishes).toBeDefined();
            expect(newUser.__typename).toEqual('User');
            const mails_received = mailServer.getSentMail();
            expect(mails_received).toHaveLength(1);
            expect(mails_received[0].to).toEqual('test@test.fr');
            expect(mails_received[0].subject).toEqual(
              'Bienvenue sur FEE, confirmez votre email'
            );
            expect(mails_received[0].template).toContain(
              'src/modules/mail/confirmation'
            );
          });
      });
    });
  });
});
