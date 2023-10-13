import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  View,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider as ReduxProvider} from 'react-redux';
import store from './store';
import SwitchComponent from './ChatSX/navigation/SwitchComponent';
import notifee, {EventType} from '@notifee/react-native';
import {getRoute} from './ChatSX/notifications/routes';
import * as RootNavigation from './RootNavigation';
import FetchKeyInputScreen from './Sample';
import {useQuery} from '@realm/react';
import {parseDeepLink} from './ChatSX/components/ParseDeepLink';
import {DeepLinkRequest} from './ChatSX/components/ParseDeepLink/models';
import {UserSchemaResponse} from './ChatSX/db/models';
import {USER_SCHEMA_RO} from './ChatSX/constants/Strings';

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
        let routes = getRoute(initialNotification?.notification?.data?.route);
        RootNavigation.navigate(routes.route, routes.params);
      }
    }
    bootstrap();
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
    <ReduxProvider store={store}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <SwitchComponent />
      </KeyboardAvoidingView>
    </ReduxProvider>
  ) : (
    <FetchKeyInputScreen isTrue={isTrue} setIsTrue={setIsTrue} />
  );
}

export default App;
