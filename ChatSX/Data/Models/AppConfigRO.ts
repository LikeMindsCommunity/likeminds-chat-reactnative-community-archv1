import Realm from 'realm';
import {APP_CONFIG_RO, BOOLEAN, INT, LIST_STRING, ID} from '../Constants';

export class AppConfigRO extends Realm.Object<AppConfigRO> {
  id!: number;
  communities!: Realm.List<string>;
  isConversationsSynced!: boolean;
  isChatroomsSynced!: boolean;
  isCommunitiesSynced!: boolean;

  static schema: Realm.ObjectSchema = {
    name: APP_CONFIG_RO,
    properties: {
      id: INT,
      communities: LIST_STRING,
      isConversationsSynced: BOOLEAN,
      isChatroomsSynced: BOOLEAN,
      isCommunitiesSynced: BOOLEAN,
    },
    primaryKey: ID,
  };
}
