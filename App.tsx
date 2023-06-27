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
import AsyncStorage from '@react-native-async-storage/async-storage';
import FetchKeyInputScreen from './Sample';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  const [userUniqueID, setUserUniqueID] = useState<any>();
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

  // this useEffect is for the sample app only
  useEffect(() => {
    async function invokeDataLayer() {
      const userUniqueID = await AsyncStorage.getItem('userUniqueID');
      setUserUniqueID(userUniqueID);
    }
    invokeDataLayer();
  }, []);

  return userUniqueID ? (
    <ReduxProvider store={store}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <SwitchComponent />
      </KeyboardAvoidingView>
    </ReduxProvider>
  ) : (
    <FetchKeyInputScreen />
  );
}

export default App;
