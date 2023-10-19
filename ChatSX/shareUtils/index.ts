import {Alert, Share} from 'react-native';
import {VALID_URI_REGEX} from '../constants/Regex';
import {ShareChatroomRequest} from './models';
import {Events, Keys} from '../enums';
import {track} from '../analytics/LMChatAnalytics';

// this method generates URL for share
export const shareChatroomURL = ({
  chatroomId,
  domain,
}: ShareChatroomRequest) => {
  let url = `${domain}/chatroom?chatroom_id=${chatroomId}`;
  return url;
};

// this function is to check URI is valid or not
export function isValidURI(uri: string): boolean {
  const regex = VALID_URI_REGEX;
  return regex.test(uri);
}

// this function helps to share chatroom url
export const onShare = async (chatroomID: number, chatroomType: number) => {
  try {
    let shareChatroomRequest = {
      chatroomId: chatroomID,
      domain: '', // Add your custom link to open app,
    };
    let shareUrl = shareChatroomURL(shareChatroomRequest);
    track(
      Events.CHAT_ROOM_SHARED,
      new Map<string, string>([
        [Keys.SOURCE, chatroomID.toString()],
        [Keys.CHATROOM_TYPE, chatroomType.toString()],
      ]),
    );
    await Share.share({
      message: shareUrl,
    });
  } catch (error: any) {
    Alert.alert(error.message);
  }
};
