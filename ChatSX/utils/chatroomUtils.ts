import {Conversation} from '@likeminds.community/chat-rn/dist/shared/responseModels/Conversation';
import {UserInfo} from '../db/models';
import {myClient} from '../..';
import {GetConversationsType} from '../enums';

// This method is to create a temporary state message for updation of chatroom topic
export const createTemporaryStateMessage = (
  currentChatroomTopic: Conversation,
  user: UserInfo,
) => {
  const temporaryStateMessage = {...currentChatroomTopic};
  if (
    temporaryStateMessage?.hasFiles == false ||
    (temporaryStateMessage?.hasFiles == true &&
      temporaryStateMessage?.answer) ||
    temporaryStateMessage?.answer
  ) {
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
    temporaryStateMessage.ogTags = undefined;
    temporaryStateMessage.createdEpoch = temporaryStateMessage.createdEpoch + 1;
  } else if (
    temporaryStateMessage?.hasFiles == true &&
    temporaryStateMessage?.attachments
  ) {
    temporaryStateMessage.answer = `<<${user?.name}|route://member_profile/${user?.id}?member_id=${user?.id}&community_id=${user?.sdkClientInfo?.community}>> set a ${temporaryStateMessage?.attachments[0]?.type} message as current topic`;
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
    temporaryStateMessage.ogTags = undefined;
    temporaryStateMessage.createdEpoch = temporaryStateMessage.createdEpoch + 1;
  }

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
  const payload = {
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
