import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {Provider as ReduxProvider} from 'react-redux';
import store from './store';
import notifee from '@notifee/react-native';
import {getRoute} from './notifications/routes';
import * as RootNavigation from './RootNavigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {setupPlayer} from './audio';
import SwitchComponent from './navigation/SwitchComponent';
import {RealmProvider} from '@realm/react';
import {UserSchemaRO} from './db/schemas/UserSchema';

function LMChatApp(): JSX.Element {
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

  return (
    <RealmProvider schema={[UserSchemaRO]}>
      <GestureHandlerRootView style={styles.flexStyling}>
        <ReduxProvider store={store}>
            <SwitchComponent />
        </ReduxProvider>
      </GestureHandlerRootView>
    </RealmProvider>
  );
}

const styles = StyleSheet.create({
  flexStyling: {
    flex: 1,
  },
});

export default LMChatApp;
