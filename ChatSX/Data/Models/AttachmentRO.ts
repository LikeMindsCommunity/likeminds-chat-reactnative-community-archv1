import {
  ATTACHMENT_META_RO,
  ATTACHMENT_RO,
  OPTIONAL_INT,
  OPTIONAL_STRING,
  STRING,
} from '../Constants';
import {AttachmentMetaRO} from './AttachmentMetaRO';
import Realm from 'realm';

export class AttachmentRO extends Realm.Object<AttachmentRO> {
  id!: string;
  url!: string;
  chatroomId!: string;
  communityId!: string;
  name?: string | null;
  type!: string;
  index?: number | null;
  width?: number | null;
  height?: number | null;
  awsFolderPath?: string | null;
  localFilePath?: string | null;
  thumbnailUrl?: string | null;
  thumbnailAWSFolderPath?: string | null;
  thumbnailLocalFilePath?: string | null;
  metaRO?: AttachmentMetaRO | null;
  createdAt?: number | null;
  updatedAt?: number | null;

  static schema: Realm.ObjectSchema = {
    name: ATTACHMENT_RO,
    embedded: true,
    properties: {
      id: STRING,
      url: STRING,
      chatroomId: STRING,
      communityId: STRING,
      name: OPTIONAL_STRING,
      type: STRING,
      index: OPTIONAL_INT,
      width: OPTIONAL_INT,
      height: OPTIONAL_INT,
      awsFolderPath: OPTIONAL_STRING,
      localFilePath: OPTIONAL_STRING,
      thumbnailUrl: OPTIONAL_STRING,
      thumbnailAWSFolderPath: OPTIONAL_STRING,
      thumbnailLocalFilePath: OPTIONAL_STRING,
      metaRO: `${ATTACHMENT_META_RO}?`,
      createdAt: OPTIONAL_INT,
      updatedAt: OPTIONAL_INT,
    },
  };
}
