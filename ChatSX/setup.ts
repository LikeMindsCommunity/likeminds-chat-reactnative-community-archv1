import notifee, {EventType} from '@notifee/react-native';
import getNotification from './notifications';
import {getRoute} from './notifications/routes';
import * as RootNavigation from './RootNavigation';
import messaging from '@react-native-firebase/messaging';
import TrackPlayer from 'react-native-track-player';
import {playbackService} from './audio';
import {LMChatClient} from '@likeminds.community/chat-rn';

export const initMyClient = (apiKey: string) => {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    const routes = getRoute(detail?.notification?.data?.route);

    if (type === EventType.PRESS) {
      if (RootNavigation) {
        setTimeout(() => {
          RootNavigation.navigate(routes.route, routes.params); // e.g. navigate(CHATROOM, {chatroomID: 69285});
        }, 1000);
      }
    }
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    const val = await getNotification(remoteMessage);
    return val;
  });

  TrackPlayer.registerPlaybackService(() => playbackService);

  const myClient = LMChatClient.setApiKey(apiKey)
    .setPlatformCode('rn')
    .setVersionCode(parseInt('23'))
    .build();

  return myClient;
};
