import {
  BOOLEAN,
  ID,
  INT,
  MEMBER_RO,
  OPTINAL_SDK_CLIENT_INFO_RO,
  OPTIONAL_INT,
  OPTIONAL_STRING,
  STRING,
} from "../constants";
import { SDKClientInfoRO } from "./SDKClientInfoRO";
import Realm from "realm";

export class MemberRO extends Realm.Object<MemberRO> {
  uid!: string;
  id!: string;
  name!: string;
  imageUrl!: string;
  state!: number;
  customIntroText?: string | null;
  customClickText?: string | null;
  customTitle?: string | null;
  communityId?: number | null;
  isOwner!: boolean;
  isGuest!: boolean;
  userUniqueId!: string;
  uuid!: string;
  sdkClientInfoRO?: SDKClientInfoRO | null;

  static schema: Realm.ObjectSchema = {
    name: MEMBER_RO,
    properties: {
      uid: STRING,
      id: STRING,
      name: STRING,
      imageUrl: STRING,
      state: INT,
      customIntroText: OPTIONAL_STRING,
      customClickText: OPTIONAL_STRING,
      customTitle: OPTIONAL_STRING,
      communityId: OPTIONAL_INT,
      isOwner: BOOLEAN,
      isGuest: BOOLEAN,
      userUniqueId: STRING,
      uuid: STRING,
      sdkClientInfoRO: OPTINAL_SDK_CLIENT_INFO_RO,
    },
    primaryKey: ID,
  };
}
