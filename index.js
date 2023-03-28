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
  console.log('User pressed an action with the id: ', pressAction?.id);
  const {navigate} = navigationRef?.current;
  console.log('navigation ', detail?.notification?.data?.route);
  let route = getRoute(detail?.notification?.data?.route)

  if (type === EventType.PRESS) {
    navigate('ChatRoom', {chatroomID: 69285});
    // navigation.navigate('ChatRoom', {chatroomID: 69285});
    // navigate here
  }
  // await notifee.cancelNotification(notification.id);
  // console.log('background-event');
  return null;
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // console.log('Message handled in the background!', remoteMessage);
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
