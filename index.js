/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import LikeMinds from 'likeminds-chat-rn-beta';

export const myClient = new LikeMinds({
  apiKey: '', // Put API key that you get from Dashboard
});

AppRegistry.registerComponent(appName, () => App);
