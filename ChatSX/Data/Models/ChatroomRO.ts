import {
  BOOLEAN,
  CHATROOMS,
  CHATROOM_RO,
  COMMUNITY_RO,
  ID,
  INT,
  LINKING_OBJECTS,
  LIST_CONVERSATION_RO,
  LIST_INT,
  LIST_REACTION_RO,
  OPTIONAL_BOOLEAN,
  OPTIONAL_INT,
  OPTIONAL_LIST_COMMUNITY_RO,
  OPTIONAL_MEMBER_RO,
  OPTIONAL_STRING,
  OPTONAL_CONVERSATION_RO,
  OPTONAL_LAST_CONVERSATION_RO,
  STRING,
} from '../constants';
import {CommunityRO} from './CommunityRO';
import {ConversationRO} from './ConversationRO';
import {LastConversationRO} from './LastConversationRO';
import {MemberRO} from './MemberRO';
import {ReactionRO} from './ReactionRO';
import Realm from 'realm';

export class ChatroomRO extends Realm.Object<ChatroomRO> {
  id!: string;
  communityId!: string;
  title!: string;
  state!: number;
  member?: MemberRO | null;
  createdAt?: number | null;
  type?: number | null;
  chatroomImageUrl?: string | null;
  header?: string | null;
  cardCreationTime?: string | null;
  totalResponseCount!: number;
  totalAllResponseCount!: number;
  muteStatus?: boolean | null;
  followStatus?: boolean | null;
  hasBeenNamed?: boolean | null;
  date?: string | null;
  isTagged?: boolean | null;
  isPending?: boolean | null;
  deletedBy?: string | null;
  updatedAt?: number | null;
  lastConversation?: ConversationRO | null;
  lastConversationRO?: LastConversationRO | null;
  lastSeenConversationId?: string | null;
  lastSeenConversation?: ConversationRO | null;
  dateEpoch?: number | null;
  unseenCount!: number;
  relationshipNeeded!: boolean;
  draftConversation?: string | null;
  isSecret?: boolean | null;
  secretChatRoomParticipants!: Realm.List<number>;
  secretChatRoomLeft?: boolean | null;
  conversations!: Realm.List<ConversationRO>;
  topicId?: string | null;
  topic?: ConversationRO | null;
  autoFollowDone?: boolean | null;
  memberCanMessage?: boolean | null;
  isEdited?: boolean | null;
  reactions!: Realm.List<ReactionRO>;
  unreadConversationsCount?: number | null;
  accessWithoutSubscription!: boolean;
  externalSeen?: boolean | null;
  isConversationStored!: boolean;
  isDraft?: boolean | null;
  lastConversationId?: string | null;
  communities?: Realm.Results<CommunityRO> | null;

  static schema: Realm.ObjectSchema = {
    name: CHATROOM_RO,
    properties: {
      id: STRING,
      communityId: STRING,
      title: STRING,
      state: INT,
      member: OPTIONAL_MEMBER_RO,
      createdAt: OPTIONAL_INT,
      type: OPTIONAL_INT,
      chatroomImageUrl: OPTIONAL_STRING,
      header: OPTIONAL_STRING,
      cardCreationTime: OPTIONAL_STRING,
      totalResponseCount: INT,
      totalAllResponseCount: INT,
      muteStatus: OPTIONAL_BOOLEAN,
      followStatus: OPTIONAL_BOOLEAN,
      hasBeenNamed: OPTIONAL_BOOLEAN,
      date: OPTIONAL_STRING,
      isTagged: OPTIONAL_BOOLEAN,
      isPending: OPTIONAL_BOOLEAN,
      deletedBy: OPTIONAL_STRING,
      updatedAt: OPTIONAL_INT,
      lastConversation: OPTONAL_CONVERSATION_RO,
      lastConversationRO: OPTONAL_LAST_CONVERSATION_RO,
      lastSeenConversationId: OPTIONAL_STRING,
      lastSeenConversation: OPTONAL_CONVERSATION_RO,
      dateEpoch: OPTIONAL_INT,
      unseenCount: INT,
      relationshipNeeded: BOOLEAN,
      draftConversation: OPTIONAL_STRING,
      isSecret: OPTIONAL_BOOLEAN,
      secretChatRoomParticipants: LIST_INT,
      secretChatRoomLeft: OPTIONAL_BOOLEAN,
      conversations: LIST_CONVERSATION_RO,
      topicId: OPTIONAL_STRING,
      topic: OPTONAL_CONVERSATION_RO,
      autoFollowDone: OPTIONAL_BOOLEAN,
      memberCanMessage: OPTIONAL_BOOLEAN,
      isEdited: OPTIONAL_BOOLEAN,
      reactions: LIST_REACTION_RO,
      unreadConversationsCount: OPTIONAL_INT,
      accessWithoutSubscription: BOOLEAN,
      externalSeen: OPTIONAL_BOOLEAN,
      isConversationStored: BOOLEAN,
      isDraft: OPTIONAL_BOOLEAN,
      lastConversationId: OPTIONAL_STRING,
      communities: {
        type: LINKING_OBJECTS,
        objectType: COMMUNITY_RO,
        property: CHATROOMS,
      },
    },
    primaryKey: ID,
  };
}
