import {Conversation} from '@likeminds.community/chat-rn/dist/shared/responseModels/Conversation';
import {UserInfo} from '../db/models';
import {myClient} from '../..';
import {GetConversationsType} from '../enums';

// This method is to create a temporary state message for updation of chatroom topic
export const createTemporaryStateMessage = (
  currentChatroomTopic: Conversation,
  user: UserInfo,
) => {
  let temporaryStateMessage = {...currentChatroomTopic};
  temporaryStateMessage.answer = `<<${user?.name}|route://member_profile/${user?.id}?member_id=${user?.id}&community_id=${user?.sdkClientInfo?.community}>> changed current topic to ${currentChatroomTopic?.answer}`;
  temporaryStateMessage.state = 12;
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formattedDate = currentDate.toLocaleDateString('en-GB', options);
  temporaryStateMessage.date = formattedDate;
  temporaryStateMessage.id = Date.now()?.toString();
  temporaryStateMessage.attachments = [];
  temporaryStateMessage.attachmentCount = undefined;
  temporaryStateMessage.hasFiles = false;

  return temporaryStateMessage;
};

// This method is to get above, current and below conversation and create a new conversation
export const getCurrentConversation = async (
  currentChatroomTopic: Conversation,
  chatroomId: string,
) => {
  let topicConversation;
  if (currentChatroomTopic?.id) {
    topicConversation = await myClient?.getConversation(
      currentChatroomTopic?.id,
    );
  }
  let payload = {
    chatroomId: chatroomId,
    limit: 100,
    medianConversation: currentChatroomTopic,
    type: GetConversationsType.ABOVE,
  };
  const aboveConversations = await myClient?.getConversations(payload);
  payload.type = GetConversationsType.BELOW;
  const belowConversations = await myClient?.getConversations(payload);
  let newConversation = aboveConversations.concat(
    topicConversation,
    belowConversations,
  );
  newConversation = newConversation.reverse();
  return newConversation;
};
