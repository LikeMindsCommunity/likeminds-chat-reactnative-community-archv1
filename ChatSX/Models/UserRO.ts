import Realm from 'realm';

const UserSchema = {
  name: 'User',
  properties: {
    userUniqueID: 'string',
    userName: 'string',
    apiKey: 'string',
  },
};

export default [UserSchema];
