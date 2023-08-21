import {
  ID,
  INT,
  LAST_CONVERSATION_RO,
  LIST_ATTACHMENT_RO,
  OPTIONAL_BOOLEAN,
  OPTIONAL_INT,
  OPTIONAL_LINK_RO,
  OPTIONAL_MEMBER_RO,
  OPTIONAL_STRING,
  STRING,
} from "../constants";
import { AttachmentRO } from "./AttachmentRO";
import { LinkRO } from "./LinkRO";
import { MemberRO } from "./MemberRO";
import Realm from "realm";

export class LastConversationRO extends Realm.Object<LastConversationRO> {
  id!: string;
  member?: MemberRO | null;
  createdAt?: string | null;
  answer!: string;
  state!: number;
  attachments!: Realm.List<AttachmentRO>;
  date?: string | null;
  deletedBy?: string | null;
  attachmentCount?: number | null;
  attachmentsUploaded?: boolean | null;
  uploadWorkerUUID?: string | null;
  createdEpoch!: number;
  chatroomId!: string;
  communityId!: string;
  link?: LinkRO | null;
  deletedByMember?: MemberRO | null;

  static schema: Realm.ObjectSchema = {
    name: LAST_CONVERSATION_RO,
    properties: {
      id: STRING,
      member: OPTIONAL_MEMBER_RO,
      createdAt: OPTIONAL_STRING,
      answer: STRING,
      state: INT,
      attachments: LIST_ATTACHMENT_RO,
      date: OPTIONAL_STRING,
      deletedBy: OPTIONAL_STRING,
      attachmentCount: OPTIONAL_INT,
      attachmentsUploaded: OPTIONAL_BOOLEAN,
      uploadWorkerUUID: OPTIONAL_STRING,
      createdEpoch: INT,
      chatroomId: STRING,
      communityId: STRING,
      link: OPTIONAL_LINK_RO,
      deletedByMember: OPTIONAL_MEMBER_RO,
    },
    primaryKey: ID,
  };
}
