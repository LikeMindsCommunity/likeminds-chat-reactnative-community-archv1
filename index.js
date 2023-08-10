/**
 * @format
 */
if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
// import LMChatClient from '@likeminds.community/chat-js';
import LMChatClient from 'reactnative-chat-data';
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
  console.log('remoteMsgBg', remoteMessage);
  let val = await getNotification(remoteMessage);
  return val;
});

// export const myClient = LMChatClient.setApiKey(
//   'a80df679-4fdc-4a4f-b646-dafd10603b62',
// )
//   .setPlatformCode('rn')
//   .setVersionCode(parseInt('13'))
//   .build();

export const myClient = LMChatClient.setApiKey(
  '4a663c7f-67c5-4ab7-8476-cd46bf35e22f',
)
  .setPlatformCode('rn')
  .setVersionCode(parseInt('13'))
  .build();

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
