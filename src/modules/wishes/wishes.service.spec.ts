import { AN_ID, AN_USER, A_WISHES } from '../../../__utils__/consts';
import { Test, TestingModule } from '@nestjs/testing';

import { Fixtures } from '../../../__utils__/fixtures';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseTestModule } from '../../../__utils__/MongooseTestModule';
import { WishesDBSchema } from './schemas/wishes.schema';
import { WishesService } from './wishes.service';

describe('UserService', () => {
  const db = new MongooseTestModule();
  let service: WishesService;
  let fixtures: Fixtures;

  afterAll(() => db.stop());

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await db.start(),
        MongooseModule.forFeature([{ name: 'Wishes', schema: WishesDBSchema }]),
      ],
      providers: [WishesService],
    }).compile();

    fixtures = new Fixtures();
    service = module.get<WishesService>(WishesService);
  });

  afterEach(() => db.cleanup());

  it('should be defined: fixtures and service', () => {
    expect(fixtures).toBeDefined();
    expect(service).toBeDefined();
  });

  /* Tests all services*/
  describe('findByUserID', () => {
    it('should return new wishes', async () => {
      return service.findByUserID(AN_ID).then((wishes) => {
        expect(wishes).toEqual({});
      });
    });

    it('should return wishes of a user', async () => {
      const wishes_doc = await fixtures.addWishes();
      return service.findByUserID(wishes_doc.user_id).then((wishes) => {
        expect(wishes).toEqual(A_WISHES);
      });
    });
  });

  describe('update', () => {
    it('should return a new user', async () => {
      const wishes_doc = await fixtures.addWishes();
      return service
        .update(
          { ...AN_USER, _id: wishes_doc.user_id },
          {
            coffin: 'TestChangeCoffin',
            burial_cremation: 'TestChangeCremation',
          }
        )
        .then((wishes) => {
          expect(wishes).toEqual({
            ...A_WISHES,
            coffin: 'TestChangeCoffin',
            burial_cremation: 'TestChangeCremation',
          });
        });
    });
  });
});
