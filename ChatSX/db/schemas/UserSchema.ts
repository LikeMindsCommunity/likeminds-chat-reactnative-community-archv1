export class UserSchemaRO extends Realm.Object<UserSchemaRO> {
  userUniqueID!: string;
  userName!: string;

  static schema = {
    name: 'UserSchemaRO',
    properties: {
      userUniqueID: 'string',
      userName: 'string',
    },
  };
}
