import {MemberAction} from './MemberAction';
import {Question} from './Questions';
import {SDKClientInfo} from './SDKClientInfo';

export interface Member {
  id: string;
  userUniqueId: string;
  name: string;
  imageUrl?: string;
  questionAnswers?: Question[];
  state?: number;
  isGuest: boolean;
  customIntroText?: string;
  customClickText?: string;
  memberSince?: string;
  communityName?: string;
  isOwner: boolean;
  customTitle?: string;
  menu?: MemberAction[];
  communityId?: number;
  chatroomId?: number;
  route?: string;
  attendingStatus?: boolean;
  hasProfileImage?: boolean;
  updatedAt?: number;
  sdkClientInfo: SDKClientInfo;
  uuid: string;
}
