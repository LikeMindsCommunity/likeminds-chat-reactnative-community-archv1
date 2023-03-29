/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import LikeMinds from 'likeminds-chat-rn-beta';
import notifee, {EventType} from '@notifee/react-native';
import getNotification from './notifications';
import {navigationRef} from './navigation/SwitchComponent';
import {getRoute} from './notifications/routes';

notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification, pressAction} = detail;
  const navigation = navigationRef?.current;
  let routes = getRoute(detail?.notification?.data?.route);

  if (type === EventType.PRESS) {
    if (!!navigation) {
      navigation.navigate(routes.route, routes.params); //navigate('ChatRoom', {chatroomID: 69285});
    } else {
      // navigation?.reset([
      //   {name: 'HomeFeed'},
      //   {name: 'ChatRoom', params: {chatroomID: 69285}},
      // ]);
    }
  }
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  let val = await getNotification(remoteMessage);
  return val;
});

export const myClient = new LikeMinds({
  // apiKey: 'd4356d31-306e-406d-aa4a-cd49f1b88f19',
  apiKey: '45c469dc-06e1-4f05-914e-dd02419eb53f',
  baseUrl: 'https://betaauth.likeminds.community',
  baseUrlCaravan: 'https://beta.likeminds.community',
});

AppRegistry.registerComponent(appName, () => App);
