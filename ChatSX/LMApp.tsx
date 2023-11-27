import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, Linking, Platform} from 'react-native';
import {Provider as ReduxProvider} from 'react-redux';
import store from './store';
import notifee from '@notifee/react-native';
import {getRoute} from './notifications/routes';
import * as RootNavigation from './RootNavigation';
import {parseDeepLink} from './components/ParseDeepLink';
import {DeepLinkRequest} from './components/ParseDeepLink/models';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {setupPlayer} from './audio';
import SwitchComponent from './navigation/SwitchComponent';

function LMApp(): JSX.Element {
  //To navigate onPress notification while android app is in background state / quit state.
  useEffect(() => {
    async function bootstrap() {
      const initialNotification = await notifee.getInitialNotification();

      if (initialNotification) {
        let routes = getRoute(initialNotification?.notification?.data?.route);
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

  // To get the deep link URL which was used to open the app
  useEffect(() => {
    // custom function to get the URL which was used to open the app
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL(); // This returns the link that was used to open the app
      if (url != null) {
        const uuid = 'arnav123';
        const userName = 'arnav123';

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

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ReduxProvider store={store}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}>
          <SwitchComponent />
        </KeyboardAvoidingView>
      </ReduxProvider>
    </GestureHandlerRootView>
  );
}

export default LMApp;
