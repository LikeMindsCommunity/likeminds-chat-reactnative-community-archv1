import {Alert, Share} from 'react-native';
import {ShareChatroomRequest} from '../Models/CommonFunctions';
import {VALID_URI_REGEX} from '../constants/Regex';

// this method generates URL for share
export const shareChatroomURL = ({
  chatroomId,
  domain,
}: ShareChatroomRequest) => {
  let URL = `${domain}/chatroom?chatroom_id=${chatroomId}`;
  return URL;
};

// this function is to check URI is valid or not
export function isValidURI(uri: string): boolean {
  const regex = VALID_URI_REGEX;
  return regex.test(uri);
}

// this function helps to share chatroom url
export const onShare = async (chatroomID: number) => {
  try {
    let shareChatroomRequest = {
      chatroomId: chatroomID,
      domain: 'https://rnsampleapp.com/', // Add your custom link to open app,
    };
    let shareUrl = shareChatroomURL(shareChatroomRequest);

    await Share.share({
      message: shareUrl,
    });
  } catch (error: any) {
    Alert.alert(error.message);
  }
};
