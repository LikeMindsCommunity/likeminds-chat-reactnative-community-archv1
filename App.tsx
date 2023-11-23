import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, Linking, Platform} from 'react-native';
import {Provider as ReduxProvider} from 'react-redux';
import store from './store';
import SwitchComponent from './ChatSX/navigation/SwitchComponent';
import notifee from '@notifee/react-native';
import {getRoute} from './ChatSX/notifications/routes';
import * as RootNavigation from './RootNavigation';
import FetchKeyInputScreen from './Sample';
import {useQuery} from '@realm/react';
import {parseDeepLink} from './ChatSX/components/ParseDeepLink';
import {DeepLinkRequest} from './ChatSX/components/ParseDeepLink/models';
import {UserSchemaResponse} from './ChatSX/db/models';
import {USER_SCHEMA_RO} from './ChatSX/constants/Strings';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {setupPlayer} from './ChatSX/audio';
import {GiphySDK} from '@giphy/react-native-sdk';

function App(): JSX.Element {
  const users = useQuery<UserSchemaResponse>(USER_SCHEMA_RO);
  const [userUniqueID, setUserUniqueID] = useState(users[0]?.userUniqueID);
  const [userName, setUserName] = useState(users[0]?.userName);
  const [isTrue, setIsTrue] = useState(true);

  useEffect(() => {
    setUserName(users[0]?.userName);
    setUserUniqueID(users[0]?.userUniqueID);
  }, [users]);

  //To navigate onPress notification while android app is in background state / quit state.
  useEffect(() => {
    async function bootstrap() {
      const initialNotification = await notifee.getInitialNotification();

      if (initialNotification) {
        const routes = getRoute(initialNotification?.notification?.data?.route);
        setTimeout(() => {
          RootNavigation.navigate(routes.route, routes.params);
        }, 1000);
      }
    }
    bootstrap();
  }, []);

  // to initialise track player
  useEffect(() => {
    async function setup() {
      await setupPlayer();
    }
    setup();
  }, []);

  useEffect(() => {
    GiphySDK.configure({apiKey: 'uFWgh5Fl9H3tBmogUqcbDj1EfnQPcMUX'});
  }, []);

  // To get the deep link URL which was used to open the app
  useEffect(() => {
    // custom function to get the URL which was used to open the app
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL(); // This returns the link that was used to open the app
      if (url != null) {
        const uuid = users[0]?.userUniqueID;
        const userName = users[0]?.userName;

        const exampleRequest: DeepLinkRequest = {
          uri: url,
          uuid: uuid, // uuid
          userName: userName, // user name
          isGuest: false,
        };

        // Example usage to call parseDeepLink() method
        parseDeepLink(exampleRequest, response => {
          // Parsed response
        });
      }
    };
    getInitialURL();
  }, []);

  return userUniqueID && userName ? (
    <GestureHandlerRootView style={{flex: 1}}>
      <ReduxProvider store={store}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <SwitchComponent />
        </KeyboardAvoidingView>
      </ReduxProvider>
    </GestureHandlerRootView>
  ) : (
    <FetchKeyInputScreen isTrue={isTrue} setIsTrue={setIsTrue} />
  );
}

export default App;
