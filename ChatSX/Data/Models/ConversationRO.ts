import {
  BOOLEAN,
  CHATROOM_RO,
  COMMUNITY_RO,
  CONVERSATIONS,
  CONVERSATION_RO,
  ID,
  INT,
  LINKING_OBJECTS,
  LIST_ATTACHMENT_RO,
  LIST_POLL_RO,
  LIST_REACTION_RO,
  OPTIONAL_BOOLEAN,
  OPTIONAL_INT,
  OPTIONAL_LINK_RO,
  OPTIONAL_LIST_CHATROOM_RO,
  OPTIONAL_LIST_COMMUNITY_RO,
  OPTIONAL_MEMBER_RO,
  OPTIONAL_STRING,
  OPTONAL_CONVERSATION_RO,
  STRING,
} from '../constants';
import {AttachmentRO} from './AttachmentRO';
import {ChatroomRO} from './ChatroomRO';
import {CommunityRO} from './CommunityRO';
import {LinkRO} from './LinkRO';
import {MemberRO} from './MemberRO';
import {PollRO} from './PollRO';
import {ReactionRO} from './ReactionRO';
import Realm from 'realm';

export class ConversationRO extends Realm.Object<ConversationRO> {
  id!: string;
  chatroomId!: string;
  communityId!: string;
  member?: MemberRO | null;
  answer!: string;
  state!: number;
  createdEpoch!: number;
  createdAt?: string | null;
  attachments!: Realm.List<AttachmentRO>;
  // link?: LinkRO | null;
  date?: string | null;
  isEdited?: boolean | null;
  lastSeen!: boolean;
  replyConversationId?: string | null;
  // replyConversation?: Realm.List<ConversationRO> | null;
  deletedBy?: string | null;
  attachmentCount?: number | null;
  attachmentsUploaded?: boolean | null;
  uploadWorkerUUID?: string | null;
  localSavedEpoch!: number;
  temporaryId?: string | null;
  reactions?: Realm.List<ReactionRO> | null;
  isAnonymous?: boolean | null;
  allowAddOption?: boolean | null;
  pollType?: number | null;
  pollTypeText?: string | null;
  submitTypeText?: string | null;
  expiryTime?: number | null;
  multipleSelectNum?: number | null;
  multipleSelectState?: number | null;
  polls!: Realm.List<PollRO>;
  pollAnswerText?: string | null;
  toShowResults?: boolean | null;
  replyChatRoomId?: string | null;
  lastUpdatedAt!: number;
  // deletedByMember?: MemberRO | null;
  community?: Realm.Results<CommunityRO> | null;
  chatroom?: Realm.Results<ChatroomRO> | null;

  static schema: Realm.ObjectSchema = {
    name: CONVERSATION_RO,
    properties: {
      id: STRING,
      chatroomId: STRING,
      communityId: STRING,
      // member: OPTIONAL_MEMBER_RO,
      answer: STRING,
      state: INT,
      createdEpoch: INT,
      createdAt: OPTIONAL_STRING,
      attachments: LIST_ATTACHMENT_RO,
      // link: OPTIONAL_LINK_RO,
      date: OPTIONAL_STRING,
      isEdited: OPTIONAL_BOOLEAN,
      lastSeen: BOOLEAN,
      replyConversationId: OPTIONAL_STRING,
      replyConversation: OPTONAL_CONVERSATION_RO,
      deletedBy: OPTIONAL_STRING,
      attachmentCount: OPTIONAL_INT,
      attachmentsUploaded: OPTIONAL_BOOLEAN,
      uploadWorkerUUID: OPTIONAL_STRING,
      localSavedEpoch: INT,
      temporaryId: OPTIONAL_STRING,
      reactions: LIST_REACTION_RO,
      isAnonymous: OPTIONAL_BOOLEAN,
      allowAddOption: OPTIONAL_BOOLEAN,
      pollType: OPTIONAL_INT,
      pollTypeText: OPTIONAL_STRING,
      submitTypeText: OPTIONAL_STRING,
      expiryTime: OPTIONAL_INT,
      multipleSelectNum: OPTIONAL_INT,
      multipleSelectState: OPTIONAL_INT,
      polls: LIST_POLL_RO,
      pollAnswerText: OPTIONAL_STRING,
      toShowResults: OPTIONAL_BOOLEAN,
      replyChatRoomId: OPTIONAL_STRING,
      lastUpdatedAt: INT,
      // deletedByMember: OPTIONAL_MEMBER_RO,
      community: {
        type: LINKING_OBJECTS,
        objectType: COMMUNITY_RO,
        property: CONVERSATIONS,
      },
      chatroom: {
        type: LINKING_OBJECTS,
        objectType: CHATROOM_RO,
        property: CONVERSATIONS,
      },
    },
    primaryKey: ID,
  };
}
