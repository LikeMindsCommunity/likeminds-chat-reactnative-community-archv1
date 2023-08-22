import {INT, SDK_CLIENT_INFO_RO, STRING} from '../constants';
import Realm from 'realm';

export class SDKClientInfoRO extends Realm.Object<SDKClientInfoRO> {
  community!: number;
  user!: string;
  userUniqueId!: string;
  uuid!: string;

  static schema: Realm.ObjectSchema = {
    name: SDK_CLIENT_INFO_RO,
    embedded: true,
    properties: {
      community: INT,
      user: STRING,
      userUniqueId: STRING,
      uuid: STRING,
    },
  };
}
