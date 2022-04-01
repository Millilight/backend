import { Test, TestingModule } from '@nestjs/testing';
import { User, UserSchema } from './schemas/user.schema';

import { Fixtures } from '@/utils/fixtures';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MongooseTestModule
} from '@/utils/MongooseTestModule';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UserService', () => {
  const db = new MongooseTestModule();
  let service: UsersService;
  let fixtures: Fixtures;

  afterAll(() => db.stop());
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await db.start(),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UsersService],
    }).compile();
    fixtures = new Fixtures();
    service = module.get<UsersService>(UsersService);
  });
  afterEach(() => db.cleanup());

  it('should be defined', () => {
    expect(fixtures).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create user', () => {
    it('should return a new user', () => {
      return service
        .create({
          lastname: 'TestLastname',
          firstname: 'TestFirstname',
          email: 'test@test.fr',
          password: 'Test1234@',
        })
        .then((data) => {
          expect(data._id).toBeDefined();
          expect(data.lastname).toEqual('TestLastname');
          expect(data.firstname).toEqual('TestFirstname');
          expect(data.email).toEqual('test@test.fr');
          expect(data.password).toMatch(/^\$2[ayb]\$.{56}$/);
          expect(data.wishes).toBeDefined();
        });
    });
  });

  describe('get user for auth', () => {
    it('should return the user', async () => {
      await fixtures.addUser();
      return service.getWithAuth('test@test.fr', 'Test1234@')
        .then((data) => {
          expect(data._id).toBeDefined();
          expect(data.email).toEqual('test@test.fr');
          expect(data.lastname).toEqual('TestLastname');
          expect(data.firstname).toEqual('TestFirstname');
          expect(data.password).toMatch(/^\$2[ayb]\$.{56}$/);
        });
    });

    it('should return NotFoundException', async () => {
      await expect(service.getWithAuth('notfound@test.fr', 'Test1234@'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('find user by id', () => {
    // TODO : get the newly added user _id so as to findByID
    // it('should return the user', async () => {
    //   await fixtures.addUser();
    //   return service.findByID('test@test.fr')
    //     .then((data) => {
    //       expect(data._id).toBeDefined();
    //       expect(data.email).toEqual('test@test.fr');
    //       expect(data.lastname).toEqual('TestLastname');
    //       expect(data.firstname).toEqual('TestFirstname');
    //     });
    // });

    it('should return NotFoundException', async () => {
      await expect(service.findByID('624c3a905d3227f0ce675fd1'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  // TODO : findByIDWithNewEmailAndNewEmailToken & findByIDAndNewMailTokenWithNewEMailAndNewEmailToken avec la même remarque que pour findByID

  describe('update a user', () => {
    // TODO: same _id problem
    // it('should return the user with lastname updated', async () => {
    //   await fixtures.addUser();
    //   return service.updateUser({
    //     _id: '',
    //     lastname: 'TestLastname',
    //     firstname: 'TestFirstname',
    //     email: 'test@test.fr',
    //     wishes: {}
    //   }, {
    //     lastname: 'changeLastname'
    //   })
    //     .then((data) => {
    //       expect(data._id).toBeDefined();
    //       expect(data.email).toEqual('test@test.fr');
    //       expect(data.lastname).toEqual('changeLastname');
    //       expect(data.firstname).toEqual('TestFirstname');
    //     });
    // });

    // it('should return NotFoundException', async () => {
    //   await expect(service.updateUser('notfound@test.fr', 'Test1234@'))
    //     .rejects
    //     .toThrow(NotFoundException);
    // });
  });
  
});
