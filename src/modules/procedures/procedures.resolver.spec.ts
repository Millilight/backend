import * as mocks_procedures from '../../../__utils__/mocks.procedures';

import { AN_USER, A_PROCEDURES } from '../../../__utils__/consts';
import {
  ProceduresResolver,
  ProceduresUserResolver,
} from './procedures.resolver';
import { Test, TestingModule } from '@nestjs/testing';

import { ProceduresService } from './procedures.service';

describe('ProceduresResolver', () => {
  let resolver: ProceduresResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProceduresResolver,
        {
          provide: ProceduresService,
          useFactory: () => ({
            update: mocks_procedures.update,
            findByUserID: mocks_procedures.findByUserID,
          }),
        },
      ],
    }).compile();

    resolver = module.get<ProceduresResolver>(ProceduresResolver);
  });

  it('should be defined before each', () => {
    expect(resolver).toBeDefined();
  });

  describe('updateProcedures', () => {
    it('should update the procedures', () => {
      return resolver
        .updateProcedures(AN_USER, {
          vehicles: [
            {
              type: 'Tracteur',
              registration_number: '123456789',
            },
          ],
          insurance_products: [
            {
              type: 'assurance vie',
              company: 'AXA',
              localization: 'Uzès',
            },
          ],
        })
        .then((data) => {
          expect(data).toEqual({
            bank_products: [
              {
                company: 'Société Générale',
                localization: 'Uzès',
                type: 'compte courant',
              },
              {
                company: 'BNP Paribas',
                localization: 'Lyon',
                type: 'livret A',
              },
            ],
            vehicles: [
              {
                type: 'Tracteur',
                registration_number: '123456789',
              },
            ],
            insurance_products: [
              {
                type: 'assurance vie',
                company: 'AXA',
                localization: 'Uzès',
              },
            ],
            properties: [
              {
                localization: 'Uzès',
                type: 'Maison',
              },
            ],
            life_insurances: [],
            consumer_credits: [],
            internet_accounts_to_be_deleted: [],
          });
        });
    });
  });
});

describe('ProceduresUserResolver', () => {
  let resolver: ProceduresUserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProceduresUserResolver,
        {
          provide: ProceduresService,
          useFactory: () => ({
            findByUserID: mocks_procedures.findByUserID,
          }),
        },
      ],
    }).compile();

    resolver = module.get<ProceduresUserResolver>(ProceduresUserResolver);
  });

  it('should be defined before each', () => {
    expect(resolver).toBeDefined();
  });

  describe('procedures', () => {
    it('should return procedures', () => {
      return resolver
        .procedures({ user_id: AN_USER._id, procedures: undefined })
        .then((data) => {
          expect(data).toEqual(A_PROCEDURES);
        });
    });
  });
});
