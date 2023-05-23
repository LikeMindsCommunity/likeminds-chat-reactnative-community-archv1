/**
 * @format
 */

// need to remove Reactotron code from index.js and
// `@react-native-async-storage/async-storage`, `reactotron-react-native` packages from package.json
// as they are only for debugging purpose only
if (__DEV__) {
  import('./ReactotronConfig').then();
}

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import LikeMinds from 'likeminds-chat-rn-beta';
import notifee, {EventType} from '@notifee/react-native';
import getNotification from './notifications';
import {getRoute} from './notifications/routes';
import * as RootNavigation from './RootNavigation';

notifee.onBackgroundEvent(async ({type, detail}) => {
  let routes = getRoute(detail?.notification?.data?.route);

  if (type === EventType.PRESS) {
    if (!!RootNavigation) {
      RootNavigation.navigate(routes.route, routes.params); // e.g. navigate(CHATROOM, {chatroomID: 69285});
    }
  }
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  let val = await getNotification(remoteMessage);
  return val;
});

export const myClient = new LikeMinds({
  apiKey: '',
  xVersionCode:'7',
  xPlatformCode: 'rn',
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
