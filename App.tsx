import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider as ReduxProvider} from 'react-redux';
import store, {persistor} from './store';
import SwitchComponent from './navigation/SwitchComponent';
import notifee, {EventType} from '@notifee/react-native';
import {getRoute} from './notifications/routes';
import * as RootNavigation from './RootNavigation';
import {PersistGate} from 'redux-persist/integration/react';

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
      {/* <PersistGate loading={null} persistor={persistor}> */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <SwitchComponent />
        </KeyboardAvoidingView>
      {/* </PersistGate> */}
    </ReduxProvider>
  );
}

export default App;
