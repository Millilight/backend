import { AN_ID, AN_USER, A_PROCEDURES } from '../../../__utils__/consts';
import { Test, TestingModule } from '@nestjs/testing';

import { Fixtures } from '../../../__utils__/fixtures';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseTestModule } from '../../../__utils__/MongooseTestModule';
import { ProceduresDBSchema } from './schemas/procedures.schema';
import { ProceduresService } from './procedures.service';

describe('ProceduresService', () => {
  const db = new MongooseTestModule();
  let service: ProceduresService;
  let fixtures: Fixtures;

  afterAll(() => db.stop());

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await db.start(),
        MongooseModule.forFeature([
          { name: 'Procedures', schema: ProceduresDBSchema },
        ]),
      ],
      providers: [ProceduresService],
    }).compile();

    fixtures = new Fixtures();
    service = module.get<ProceduresService>(ProceduresService);
  });

  afterEach(() => db.cleanup());

  it('should be defined: fixtures and service', () => {
    expect(fixtures).toBeDefined();
    expect(service).toBeDefined();
  });

  /* Tests all services*/
  describe('findByUserID', () => {
    it('should return new procedures', async () => {
      return service.findByUserID(AN_ID).then((procedures) => {
        expect(procedures).toBeDefined();
      });
    });

    it('should return procedures of a user', async () => {
      const procedures_doc = await fixtures.addProcedures();
      return service.findByUserID(procedures_doc.user_id).then((procedures) => {
        expect(procedures).toEqual({
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
          properties: [
            {
              localization: 'Uzès',
              type: 'Maison',
            },
          ],
          life_insurances: [],
          consumer_credits: [],
          insurance_products: [],
          internet_accounts_to_be_deleted: [],
          vehicles: [],
        });
      });
    });
  });

  describe('update', () => {
    it('should return a new user', async () => {
      const procedures_doc = await fixtures.addProcedures();
      return service
        .update(
          { ...AN_USER, _id: procedures_doc.user_id },
          {
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
              {
                company: 'LCL',
                localization: 'Lyon',
                type: 'livret jeune',
              },
            ],
            insurance_products: [
              {
                company: 'AXA',
                localization: 'Uzès',
                type: 'assurance vie',
              },
            ],
          }
        )
        .then((procedures) => {
          expect(procedures).toEqual({
            ...A_PROCEDURES,
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
              {
                company: 'LCL',
                localization: 'Lyon',
                type: 'livret jeune',
              },
            ],
            insurance_products: [
              {
                company: 'AXA',
                localization: 'Uzès',
                type: 'assurance vie',
              },
            ],
            consumer_credits: [],
            internet_accounts_to_be_deleted: [],
            vehicles: [],
          });
        });
    });
  });
});
