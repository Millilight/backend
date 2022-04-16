import * as mocks_wishes from '../../../__utils__/mocks.wishes';

import { AN_USER, A_WISHES } from '../../../__utils__/consts';
import { Test, TestingModule } from '@nestjs/testing';
import { WishesResolver, WishesUserResolver } from './wishes.resolver';

import { WishesService } from './wishes.service';

describe('WishesResolver', () => {
  let resolver: WishesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishesResolver,
        {
          provide: WishesService,
          useFactory: () => ({
            update: mocks_wishes.update,
          }),
        },
      ],
    }).compile();

    resolver = module.get<WishesResolver>(WishesResolver);
  });

  it('should be defined before each', () => {
    expect(resolver).toBeDefined();
  });

  describe('updateWishes', () => {
    it('should update the wishes', () => {
      return resolver
        .updateWishes(AN_USER, {
          burial_cremation: 'TEST1',
          burial_cremation_place: 'TEST2',
          music: 'TEST3',
        })
        .then((data) => {
          expect(data).toEqual({
            ...A_WISHES,
            burial_cremation: 'TEST1',
            burial_cremation_place: 'TEST2',
            music: 'TEST3',
          });
        });
    });
  });
});

describe('WishesUserResolver', () => {
  let resolver: WishesUserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishesUserResolver,
        {
          provide: WishesService,
          useFactory: () => ({
            findByUserID: mocks_wishes.findByUserID,
          }),
        },
      ],
    }).compile();

    resolver = module.get<WishesUserResolver>(WishesUserResolver);
  });

  it('should be defined before each', () => {
    expect(resolver).toBeDefined();
  });

  describe('wishes', () => {
    it('should return wishes', () => {
      return resolver
        .wishes({ user_id: AN_USER._id, wishes: undefined })
        .then((data) => {
          expect(data).toEqual(A_WISHES);
        });
    });
  });
});
