import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

function App(): JSX.Element {
  const users = useQuery('UserSchemaRO');
  const [userUniqueID, setUserUniqueID] = useState<any>(users[0]?.userUniqueID);
  const [userName, setUserName] = useState<any>(users[0]?.userName);
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
