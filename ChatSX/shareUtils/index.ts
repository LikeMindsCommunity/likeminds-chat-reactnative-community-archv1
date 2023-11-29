import {Alert, Share} from 'react-native';
import {VALID_URI_REGEX} from '../constants/Regex';
import {ShareChatroomRequest} from './models';
import {Events, Keys} from '../enums';
import {LMChatAnalytics} from '../analytics/LMChatAnalytics';
import {getChatroomType} from '../utils/analyticsUtils';

// this method generates URL for share
export const shareChatroomURL = ({
  chatroomId,
  domain,
}: ShareChatroomRequest) => {
  const url = `${domain}/chatroom?chatroom_id=${chatroomId}`;
  return url;
};

// this function is to check URI is valid or not
export function isValidURI(uri: string): boolean {
  const regex = VALID_URI_REGEX;
  return regex.test(uri);
}

// this function helps to share chatroom url
export const onShare = async (
  chatroomID: number,
  chatroomType: number,
  isSecret?: boolean,
) => {
  try {
    const shareChatroomRequest = {
      chatroomId: chatroomID,
      domain: '', // Add your custom link to open app,
    };
    const shareUrl = shareChatroomURL(shareChatroomRequest);
    LMChatAnalytics.track(
      Events.CHAT_ROOM_SHARED,
      new Map<string, string>([
        [Keys.SOURCE, chatroomID?.toString()],
        [Keys.CHATROOM_FEED, 'chatroom'],
        [
          Keys.CHATROOM_TYPE,
          getChatroomType(chatroomType?.toString(), isSecret),
        ],
      ]),
    );
    await Share.share({
      message: shareUrl,
    });
  } catch (error: any) {
    Alert.alert(error.message);
  }
};
