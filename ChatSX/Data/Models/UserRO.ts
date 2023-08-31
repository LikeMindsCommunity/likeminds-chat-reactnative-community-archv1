import {
  BOOLEAN,
  ID,
  INT,
  OPTINAL_SDK_CLIENT_INFO_RO,
  OPTIONAL_BOOLEAN,
  OPTIONAL_STRING,
  STRING,
  USER_RO,
} from "../Constants";
import { SDKClientInfoRO } from "./SDKClientInfoRO";
import Realm from "realm";

export class UserRO extends Realm.Object<UserRO> {
  id!: string;
  userUniqueId!: string;
  imageUrl!: string;
  isGuest!: boolean;
  name!: string;
  organizationName?: string | null;
  updatedAt!: number;
  sdkClientInfoRO?: SDKClientInfoRO | null;
  isDeleted?: boolean | null;
  customTitle?: string | null;
  uuid!: string;

  static schema: Realm.ObjectSchema = {
    name: USER_RO,
    properties: {
      id: STRING,
      userUniqueId: STRING,
      imageUrl: STRING,
      isGuest: BOOLEAN,
      name: STRING,
      organizationName: OPTIONAL_STRING,
      updatedAt: INT,
      sdkClientInfoRO: OPTINAL_SDK_CLIENT_INFO_RO,
      isDeleted: OPTIONAL_BOOLEAN,
      customTitle: OPTIONAL_STRING,
      uuid: STRING,
    },
    primaryKey: ID,
  };
}
