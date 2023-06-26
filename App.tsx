import React, {useEffect} from 'react';
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

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
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

  return (
    <ReduxProvider store={store}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <SwitchComponent />
      </KeyboardAvoidingView>
    </ReduxProvider>
  );
}

export default App;
