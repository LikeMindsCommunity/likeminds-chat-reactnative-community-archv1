import {
  View,
  Text,
  Alert,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import * as React from 'react';
import {useEffect} from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeFeed from '../../screens/HomeFeed';
import ExploreFeed from '../../screens/ExploreFeed';
import ChatRoom from '../../screens/ChatRoom';
import {useAppDispatch, useAppSelector} from '../../store';
import ReportScreen from '../../screens/ReportMessage';
import ImageScreen from '../../components/ImageScreen';
import {
  LoaderChatroomComponent,
  LoaderComponent,
} from '../../components/LoaderComponent';
import ToastMessage from '../../components/ToastMessage';
import {
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  SHOW_TOAST,
} from '../../store/types/types';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {getRoute} from '../../notifications/routes';
import {navigationRef} from '../../RootNavigation';
import getNotification from '../../notifications';
import ViewParticipants from '../../screens/ViewParticipants';
import AddParticipants from '../../screens/AddParticipants';
import DmAllMembers from '../../screens/DmAllMembers';
import FileUpload from '../../screens/FIleUpload';
import {
  ADD_PARTICIPANTS,
  CHATROOM,
  DM_ALL_MEMBERS,
  EXPLORE_FEED,
  HOMEFEED,
  IMAGE_SCREEN,
  FILE_UPLOAD,
  REPORT,
  VIEW_PARTICIPANTS,
  VIDEO_PLAYER,
  CAROUSEL_SCREEN,
  POLL_RESULT,
  CREATE_POLL_SCREEN,
  IMAGE_CROP_SCREEN,
} from '../../constants/Screens';
import VideoPlayer from '../../screens/VideoPlayer';
import CarouselScreen from '../../screens/CarouselScreen';
import PollResult from '../../components/PollResult';
import {CreatePollScreen} from '../../components/Poll';
import ImageCropScreen from '../../screens/ImageCrop';
import {ImageCropScreenProps} from '../../screens/ImageCrop/models';
import {RootStackParamList} from './models';

const Stack = createNativeStackNavigator<RootStackParamList>();

const SwitchComponent = () => {
  const {count, chatroomCount} = useAppSelector(state => state.loader);
  const {isToast, toastMessage, statusBarStyle} = useAppSelector(
    state => state.homefeed,
  );
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
              setTimeout(() => {
                navigation.navigate(
                  routes?.route as never,
                  routes?.params as never,
                );
              }, 1000);
            }
          } else {
            navigation.navigate(
              routes?.route as never,
              routes?.params as never,
            ); //navigate(CHATROOM, {chatroomID: 69285});
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  const linking = {
    prefixes: [''], // Add your custom link to open app, and don't add / after the link.
  };

  return (
    <View style={{flex: 1}}>
      <StatusBar barStyle={statusBarStyle} />
      <NavigationContainer
        linking={linking}
        ref={navigationRef}
        independent={true}>
        <Stack.Navigator initialRouteName={HOMEFEED}>
          <Stack.Screen name={HOMEFEED} component={HomeFeed} />
          <Stack.Screen name={EXPLORE_FEED} component={ExploreFeed} />
          <Stack.Screen
            name={CHATROOM}
            component={ChatRoom}
            options={{gestureEnabled: Platform.OS === 'ios' ? false : true}}
          />
          <Stack.Screen name={REPORT} component={ReportScreen} />
          <Stack.Screen name={IMAGE_SCREEN} component={ImageScreen} />
          <Stack.Screen name={VIEW_PARTICIPANTS} component={ViewParticipants} />
          <Stack.Screen name={ADD_PARTICIPANTS} component={AddParticipants} />
          <Stack.Screen name={DM_ALL_MEMBERS} component={DmAllMembers} />
          <Stack.Screen
            options={{gestureEnabled: Platform.OS === 'ios' ? false : true}}
            name={FILE_UPLOAD}
            component={FileUpload}
          />
          <Stack.Screen name={VIDEO_PLAYER} component={VideoPlayer} />
          <Stack.Screen
            options={{gestureEnabled: false}}
            name={CAROUSEL_SCREEN}
            component={CarouselScreen}
          />
          <Stack.Screen
            options={{gestureEnabled: false}}
            name={POLL_RESULT}
            component={PollResult}
          />
          <Stack.Screen
            // options={{headerShown: false, gestureEnabled: false}}
            name={CREATE_POLL_SCREEN}
            component={CreatePollScreen}
          />
          <Stack.Screen
            options={{headerShown: false}}
            name={IMAGE_CROP_SCREEN}
            component={ImageCropScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <ToastMessage
        message={toastMessage}
        isToast={isToast}
        onDismiss={() => {
          dispatch({type: SHOW_TOAST, body: {isToast: false, msg: ''}});
        }}
      />
      {chatroomCount > 0 && <LoaderChatroomComponent />}
    </View>
  );
};

export default SwitchComponent;
