import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TrustDocument, TrustsDBSchema } from './schemas/trusts.schema';

import { Fixtures } from '../../../__utils__/fixtures';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseTestModule } from '../../../__utils__/MongooseTestModule';
import { StateTrust } from '@gqltypes';
import { TrustsService } from './trusts.service';
import mongoose from 'mongoose';
import { userDocToUser } from '@/utils/parsers';

describe('UserService', () => {
  const db = new MongooseTestModule();
  let service: TrustsService;
  let fixtures: Fixtures;

  afterAll(() => db.stop());
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        await db.start(),
        MongooseModule.forFeature([{ name: 'Trusts', schema: TrustsDBSchema }]),
      ],
      providers: [TrustsService],
    }).compile();
    fixtures = new Fixtures();
    service = module.get<TrustsService>(TrustsService);
  });
  afterEach(() => db.cleanup());

  it('should be defined: fixtures and service', () => {
    expect(fixtures).toBeDefined();
    expect(service).toBeDefined();
  });

  /* Tests all services */
  describe('create', () => {
    it('should return a new trust', async () => {
      const legator_user = await fixtures.addLegatorUser();
      const heir_user = await fixtures.addHeirUser();
      return service
        .create(userDocToUser(legator_user), userDocToUser(heir_user))
        .then(async (heir) => {
          expect(heir._id).toEqual(heir_user._id);
          expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
          expect(heir.security_code).toBeDefined();
          expect(heir.added_date).toBeDefined();
          expect(heir.urgent_data_unlocked).toEqual(false);
          expect(heir.sensitive_data_unlocked).toEqual(false);

          // And in db
          const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
            heir_user_id: heir_user._id,
            legator_user_id: legator_user._id
          })
            .exec();
          expect(trust_doc).toBeDefined();
        });
    });

    it('should not create a duplicated trust', async () => {
      const legator_user = await fixtures.addLegatorUser();
      const heir_user = await fixtures.addHeirUser();
      await service
        .create(userDocToUser(legator_user), userDocToUser(heir_user))
        .then(async (heir) => {
          expect(heir._id).toEqual(heir_user._id);
          expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
          expect(heir.security_code).toBeDefined();
          expect(heir.added_date).toBeDefined();
          expect(heir.urgent_data_unlocked).toEqual(false);
          expect(heir.sensitive_data_unlocked).toEqual(false);

          // And in db
          const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
            heir_user_id: heir_user._id,
            legator_user_id: legator_user._id
          })
            .exec();
          expect(trust_doc).toBeDefined();
        });

        return expect(
          service.create(
            userDocToUser(legator_user),
            userDocToUser(heir_user)
          ))
          .rejects.toThrowError(new ConflictException('Trust already registered'));
      });

      it('should not create a trust with ourself', async () => {
        const legator_user = await fixtures.addLegatorUser();
        await expect(service
          .create(userDocToUser(legator_user), userDocToUser(legator_user))).rejects.
          toThrowError(new ConflictException('Unable to create a trust with oneself'));
      });
    });

    describe('confirmSecurityCode', () => {
      it('should confirm security code', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        let security_code : string;
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            security_code = heir.security_code;
            expect(security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });
  
          return service
            .confirmSecurityCode(
              userDocToUser(heir_user),
              {
                legator_user_id: legator_user._id,
                security_code: security_code,
              })
            .then(async (legator) => {
              expect(legator._id).toEqual(legator_user._id);
              expect(legator.urgent_data_unlocked).toEqual(false);
              expect(legator.urgent_data).toBeUndefined();
              expect(legator.sensitive_data_unlocked).toEqual(false);
              expect(legator.sensitive_data).toBeUndefined()
              expect(legator.state).toEqual(StateTrust.VALIDATED);
  
              // And in db
              const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
                heir_user_id: heir_user._id,
                legator_user_id: legator_user._id
              })
              .exec();
              expect(trust_doc.security_code).toEqual('');
            });
      });

      it('should not confirm with wrong code', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        let security_code : string;
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            security_code = heir.security_code;
            expect(security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });
  
          return expect(service
            .confirmSecurityCode(
              userDocToUser(heir_user),
              {
                legator_user_id: legator_user._id,
                security_code: "Wrond security code",
              })
          ).rejects.toThrowError(new UnauthorizedException('Wrong security code'));
      });

      it('should not confirm security code twice', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        let security_code : string;
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            security_code = heir.security_code;
            expect(security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });
  
          await service
            .confirmSecurityCode(
              userDocToUser(heir_user),
              {
                legator_user_id: legator_user._id,
                security_code: security_code,
              })
            .then(async (legator) => {
              expect(legator._id).toEqual(legator_user._id);
              expect(legator.urgent_data_unlocked).toEqual(false);
              expect(legator.urgent_data).toBeUndefined();
              expect(legator.sensitive_data_unlocked).toEqual(false);
              expect(legator.sensitive_data).toBeUndefined()
              expect(legator.state).toEqual(StateTrust.VALIDATED);
  
              // And in db
              const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
                heir_user_id: heir_user._id,
                legator_user_id: legator_user._id
              })
              .exec();
              expect(trust_doc.security_code).toEqual('');
            });

            return expect(service
            .confirmSecurityCode(
              userDocToUser(heir_user),
              {
                legator_user_id: legator_user._id,
                security_code: security_code,
              })
            ).rejects.toThrowError(new ConflictException('Trust already confirmed'));
      });
    });

    describe('unlockUrgentData', () => {
      it('should unlock the urgent data', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            expect(heir.security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });

        return service
          .unlockUrgentData(
            heir_user._id,
            { legator_user_id: legator_user._id }
          )
          .then(async (response) => {
            expect(response.legator_user._id).toEqual(legator_user._id);
            expect(response.legator_user.urgent_data_unlocked).toEqual(true);
            expect(response.legator_user.urgent_data_unlocked_date).toBeDefined();
            //expect(response.legator_user.urgent_data).toBeDefined();
            expect(response.legator_user.sensitive_data_unlocked).toEqual(false);
            expect(response.legator_user.sensitive_data).toBeUndefined();
          });
      });

      it('should not unlock the urgent data twice', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            expect(heir.security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });

        await service
          .unlockUrgentData(
            heir_user._id,
            { legator_user_id: legator_user._id }
          )
          .then(async (response) => {
            expect(response.legator_user._id).toEqual(legator_user._id);
            expect(response.legator_user.urgent_data_unlocked).toEqual(true);
            expect(response.legator_user.urgent_data_unlocked_date).toBeDefined();
            //expect(response.legator_user.urgent_data).toBeDefined();
            expect(response.legator_user.sensitive_data_unlocked).toEqual(false);
            expect(response.legator_user.sensitive_data).toBeUndefined();
          });

          return expect(service
          .unlockUrgentData(
            heir_user._id,
            { legator_user_id: legator_user._id }
          )).rejects.toThrowError(new ConflictException('Already unlocked'));
      });
    });

    describe('findAllHeirs', () => {
      it('should find the heir', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            expect(heir.security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });

        return service
          .findAllHeirs(
            userDocToUser(legator_user)
          )
          .then(async (heirs) => {
            expect(heirs[0]._id).toEqual(heir_user._id);
          });
      });

      it('should not find heir', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            expect(heir.security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });

        return service
          .findAllHeirs(
            userDocToUser(heir_user)
          )
          .then(async (heirs) => {
            expect(heirs).toEqual([]);
          });
      });

    });

    describe('findAllLegators', () => {
      it('should find the legator', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            expect(heir.security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });

        return service
          .findAllLegators(
            userDocToUser(heir_user)
          )
          .then(async (legators) => {
            expect(legators[0]._id).toEqual(legator_user._id);
          });
      });

      it('should not find legator', async () => {
        const legator_user = await fixtures.addLegatorUser();
        const heir_user = await fixtures.addHeirUser();
        await service
          .create(userDocToUser(legator_user), userDocToUser(heir_user))
          .then(async (heir) => {
            expect(heir._id).toEqual(heir_user._id);
            expect(heir.state).toEqual(StateTrust.INVITATION_SENT);
            expect(heir.security_code).toBeDefined();
            expect(heir.added_date).toBeDefined();
            expect(heir.urgent_data_unlocked).toEqual(false);
            expect(heir.sensitive_data_unlocked).toEqual(false);
  
            // And in db
            const trust_doc = await mongoose.models.Trusts.findOne<TrustDocument>({
              heir_user_id: heir_user._id,
              legator_user_id: legator_user._id
            })
              .exec();
            expect(trust_doc).toBeDefined();
          });

        return service
          .findAllLegators(
            userDocToUser(legator_user)
          )
          .then(async (legators) => {
            expect(legators).toEqual([]);
          });
      });

    });
});