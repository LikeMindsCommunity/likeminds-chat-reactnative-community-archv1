import {
  BOOLEAN,
  COMMUNITY_RO,
  ID,
  INT,
  LIST_CHATROOM_RO,
  LIST_CONVERSATION_RO,
  OPTIONAL_INT,
  OPTIONAL_LIST_STRING,
  OPTIONAL_STRING,
  STRING,
} from '../constants';
import {ChatroomRO} from './ChatroomRO';
import {ConversationRO} from './ConversationRO';
import Realm from 'realm';

export class CommunityRO extends Realm.Object<CommunityRO> {
  id!: string;
  name!: string;
  imageUrl?: string | null;
  membersCount?: number | null;
  updatedAt?: number | null;
  relationshipNeeded!: boolean;
  downloadableContentTypes?: Realm.List<string> | null;
  conversations!: Realm.List<ConversationRO>;
  chatrooms!: Realm.List<ChatroomRO>;

  static schema: Realm.ObjectSchema = {
    name: COMMUNITY_RO,
    properties: {
      id: STRING,
      name: STRING,
      imageUrl: OPTIONAL_STRING,
      membersCount: OPTIONAL_INT,
      updatedAt: OPTIONAL_INT,
      relationshipNeeded: BOOLEAN,
      // downloadableContentTypes: OPTIONAL_LIST_STRING,
      conversations: LIST_CONVERSATION_RO,
      chatrooms: LIST_CHATROOM_RO,
    },
    primaryKey: ID,
  };
}
