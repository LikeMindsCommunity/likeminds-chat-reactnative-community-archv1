import {View, Text, Alert, PermissionsAndroid, Platform} from 'react-native';
import * as React from 'react';
import {useEffect} from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeFeed from '../screens/HomeFeed';
import ExploreFeed from '../screens/ExploreFeed';
import ChatRoom from '../screens/ChatRoom';
import {useAppDispatch, useAppSelector} from '../store';
import ReportScreen from '../screens/ReportMessage';
import ImageScreen from '../components/ImageScreen';
import {
  LoaderChatroomComponent,
  LoaderComponent,
} from '../components/LoaderComponent';
import ToastMessage from '../components/ToastMessage';
import {
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  SHOW_TOAST,
} from '../store/types/types';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidCategory,
  AndroidImportance,
  EventType,
} from '@notifee/react-native';
import {getRoute} from '../notifications/routes';
import {navigationRef} from '../RootNavigation';
import getNotification from '../notifications';
import ViewParticipants from '../screens/ViewParticipants';
import AddParticipants from '../screens/AddParticipants';
import DmAllMembers from '../screens/DmAllMembers';

const Stack = createNativeStackNavigator();

const SwitchComponent = () => {
  const {count, chatroomCount} = useAppSelector(state => state.loader);
  const {isToast, toastMessage} = useAppSelector(state => state.homefeed);
  const dispatch = useAppDispatch();
  if (Platform.OS === 'android') {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      let val = await getNotification(remoteMessage);
      return val;
    });

    notifee.onForegroundEvent(async ({type, detail}) => {
      const navigation = navigationRef?.current;
      let currentRoute = navigation?.getCurrentRoute();
      let routes = getRoute(detail?.notification?.data?.route);

      if (type === EventType.PRESS) {
        if (!!navigation) {
          if ((currentRoute?.name as any) === routes?.route) {
            if (
              JSON.stringify(routes?.params) !==
              JSON.stringify(currentRoute?.params)
            ) {
              dispatch({
                type: CLEAR_CHATROOM_CONVERSATION,
                body: {conversations: []},
              });
              dispatch({
                type: CLEAR_CHATROOM_DETAILS,
                body: {chatroomDetails: {}},
              });
              const popAction = StackActions.pop(1);
              navigation.dispatch(popAction);
              navigation.navigate(
                routes?.route as never,
                routes?.params as never,
              );
            }
          } else {
            navigation.navigate(
              routes?.route as never,
              routes?.params as never,
            ); //navigate('ChatRoom', {chatroomID: 69285});
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={{flex: 1}}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="HomeFeed">
          <Stack.Screen name="HomeFeed" component={HomeFeed} />
          <Stack.Screen name="ExploreFeed" component={ExploreFeed} />
          <Stack.Screen name="ChatRoom" component={ChatRoom} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="ImageScreen" component={ImageScreen} />
          <Stack.Screen name="ViewParticipants" component={ViewParticipants} />
          <Stack.Screen name="AddParticipants" component={AddParticipants} />
          <Stack.Screen name="DmAllMembers" component={DmAllMembers} />
        </Stack.Navigator>
      </NavigationContainer>
      <ToastMessage
        message={toastMessage}
        isToast={isToast}
        onDismiss={() => {
          dispatch({type: SHOW_TOAST, body: {isToast: false, msg: ''}});
        }}
      />
      {count > 0 && <LoaderComponent />}
      {chatroomCount > 0 && <LoaderChatroomComponent />}
    </View>
  );
};

export default SwitchComponent;
