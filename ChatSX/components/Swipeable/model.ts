import {Conversation} from '@likeminds.community/chat-rn/dist/shared/responseModels/Conversation';

export interface SwipeableParams {
  onFocusKeyboard: () => void;
  item: Conversation;
  isStateIncluded: boolean;
  children: React.ReactNode;
}
