import {Attachment} from '@likeminds.community/chat-rn/dist/shared/responseModels/Attachment';
import {Conversation} from '@likeminds.community/chat-rn/dist/shared/responseModels/Conversation';
import {MediaType} from '../enums';

export const getConversationType = (conversation: Conversation) => {
  if (conversation?.attachmentCount && conversation?.attachmentCount > 0) {
    const attachments = conversation?.attachments;
    const imageCount =
      attachments && getMediaCount(MediaType.IMAGE, attachments);
    const videoCount =
      attachments && getMediaCount(MediaType.VIDEO, attachments);
    const pdfCount = attachments && getMediaCount(MediaType.PDF, attachments);
    if (imageCount && imageCount > 0 && videoCount && videoCount > 0) {
      return MediaType.IMAGE_VIDEO;
    }
    if (imageCount && imageCount > 0) {
      return MediaType.IMAGE;
    }
    if (videoCount && videoCount > 0) {
      return MediaType.VIDEO;
    }
    if (pdfCount && pdfCount > 0) {
      return MediaType.DOC;
    }
    if (conversation?.ogTags?.url !== null) {
      return MediaType.LINK;
    }
    return MediaType.TEXT;
  } else if (conversation?.ogTags?.url !== null) {
    return MediaType.LINK;
  } else {
    return MediaType.TEXT;
  }
};

const getMediaCount = (type: string, attachments: Attachment[]) => {
  let count = 0;
  for (let i = 0; i < attachments.length; i++) {
    if (attachments[i]?.type == type) {
      count++;
    }
  }
  return count;
};

export const getChatroomType = (type: string, isSecret?: boolean) => {
  if (type == '0' && isSecret) {
    return 'secret';
  } else if (type == '7') {
    return 'announcement';
  } else if (type == '10') {
    return 'direct messages';
  } else {
    return 'normal';
  }
};
