/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// import LikeMinds from "likeminds-chat-beta";

// export const myClient = new LikeMinds({
//   apiKey: process.env.REACT_APP_API_KEY,
// });

AppRegistry.registerComponent(appName, () => App);
