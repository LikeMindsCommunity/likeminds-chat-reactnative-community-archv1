import {Conversation} from '@likeminds.community/chat-rn/dist/shared/responseModels/Conversation';

export interface InputBoxProps {
  replyChatID?: any;
  chatroomID: any;
  chatRequestState?: any;
  chatroomType?: any;
  navigation: any;
  isUploadScreen: boolean;
  isPrivateMember?: boolean;
  isDoc?: boolean;
  myRef?: any;
  previousMessage?: string;
  handleFileUpload: any;
  isEditable?: boolean;
  setIsEditable?: any;
  isSecret?: any;
  chatroomWithUser?: any;
  chatroomName?: any;
  currentChatroomTopic?: Conversation;
  isGif?: boolean;
}
