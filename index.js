/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import LMChatClient from '@likeminds.community/chat-js';
import notifee, {EventType} from '@notifee/react-native';
import getNotification from './ChatSX/notifications';
import {getRoute} from './ChatSX/notifications/routes';
import * as RootNavigation from './RootNavigation';
import React, {useState} from 'react';
import Realm from 'realm';
import {RealmProvider} from '@realm/react';
import {UserSchemaRO} from './ChatSX/db/schemas/UserSchema';

// let API_KEY = '';

// Realm.open({schema: [UserSchemaRO]}).then(realm => {
//   const users = realm.objects(UserSchemaRO.schema.name);
//   console.log('userRealmIndex.js', users);
//   API_KEY = users[0]?.apiKey;
// });

// console.log('API_KEY', API_KEY);

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

export const myClient = LMChatClient.setApiKey(
  '4707506a-a45a-4183-8856-4b6f67fb1f92',
)
  .setPlatformCode('rn')
  .setVersionCode(parseInt('14'))
  .build();

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return (
    <RealmProvider schema={[UserSchemaRO]}>
      <App />
    </RealmProvider>
  );
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
