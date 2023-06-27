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
import LMChatClient from '@likeminds.community/chat-js-beta';
import notifee, {EventType} from '@notifee/react-native';
import getNotification from './ChatSX/notifications';
import {getRoute} from './ChatSX/notifications/routes';
import * as RootNavigation from './RootNavigation';
import React from 'react';

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

export const myClient: LMChatClient = LMChatClient.setApiKey(
  'a80df679-4fdc-4a4f-b646-dafd10603b62',
)
  .setPlatformCode('rn')
  .setVersionCode(parseInt('9'))
  .build();

function HeadlessCheck({isHeadless}: any) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
