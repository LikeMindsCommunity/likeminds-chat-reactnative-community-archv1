import React, {Children, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {RealmProvider} from '@realm/react';
import {UserSchemaRO} from './db/schemas/UserSchema';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useAppDispatch} from './store';
import {Credentials} from './credentials';
import {INIT_API_SUCCESS, STORE_MY_CLIENT} from './store/types/types';
import notifee from '@notifee/react-native';
import {getRoute} from './notifications/routes';
import * as RootNavigation from './RootNavigation';
import {setupPlayer} from './audio';
import {LMChatClient} from '@likeminds.community/chat-rn';

interface LMProviderProps {
  myClient: LMChatClient;
  children: any;
}

export const LMProvider = ({
  myClient,
  children,
}: LMProviderProps): JSX.Element => {
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

  // to get dispatch
  const dispatch = useAppDispatch();

  useEffect(() => {
    // storing myClient followed by community details
    const callInitApi = async () => {
      dispatch({
        type: STORE_MY_CLIENT,
        body: {myClient: myClient},
      });

      let payload = {
        uuid: Credentials.userUniqueId, // uuid
        userName: Credentials.username, // user name
        isGuest: false,
      };

      let response = await myClient?.initiateUser(payload);

      dispatch({
        type: INIT_API_SUCCESS,
        body: {community: response?.data?.community},
      });
    };
    callInitApi();
  }, []);

  return (
    <RealmProvider schema={[UserSchemaRO]}>
      <GestureHandlerRootView style={styles.flexStyling}>
        <View style={styles.flexStyling}>{children}</View>
      </GestureHandlerRootView>
    </RealmProvider>
  );
};

const styles = StyleSheet.create({
  flexStyling: {
    flex: 1,
  },
});
