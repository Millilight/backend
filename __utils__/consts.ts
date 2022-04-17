import { User, Wishes } from '@gqltypes';

export const HASH_REGEX = /^\$2[ayb]\$.{56}$/;

export const REGEX_TOKEN = /^[a-zA-Z0-9]{32}$/;

export const AN_ID = '624af86f5998c2fdfa851b16';

export const AN_USER: User = {
  _id: AN_ID,
  firstname: 'Test',
  lastname: 'Test',
  email: 'test@test.fr',
  heirs: undefined,
  legators: undefined,
  urgent_data: {
    user_id: AN_ID,
    wishes: undefined,
  },
};

export const A_TOKEN = 'xzYjBolsAUaJFnIVP1MxWWf2Plu0Ro4z';

export const A_WISHES: Wishes = {
  burial_cremation: 'TestCremation',
  burial_cremation_place: 'TestCremationPlace',
};

export const A_JWT = '1234';
