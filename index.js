/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import LikeMinds from 'likeminds-chat-rn-beta';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

export const myClient = new LikeMinds({
  apiKey: '', // Put API key that you get from Dashboard
});

AppRegistry.registerComponent(appName, () => App);
