import { SDKClientInfo } from "./SDKClientInfo";

export interface User {
  id: string;
  imageUrl: string;
  isGuest: boolean;
  name: string;
  organisationName?: string;
  sdkClientInfo?: SDKClientInfo;
  isDeleted?: boolean;
  customTitle?: string;
  updatedAt?: number;
  userUniqueId: string;
  uuid: string;
  isOwner?: boolean;
}
