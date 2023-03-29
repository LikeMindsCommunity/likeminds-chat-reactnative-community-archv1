import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import React from 'react';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  // if (enabled) {
  //   console.log('Firebase authorization:', authStatus);
  // }
}

export const checkToken = async () => {
  const fcmToken = await messaging().getToken();
  // if (fcmToken) {
  //   console.log(fcmToken);
  // }
  return fcmToken;
  // await AsyncStorage.setItem("fcmToken", fcmToken);
};

export default async function getNotification(remoteMessage: any) {
  const channelId = await notifee.createChannel({
    id: 'important',
    name: 'Important Notifications',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: remoteMessage?.data?.title,
    body: remoteMessage?.data?.sub_title,
    data: remoteMessage?.data,
    id: remoteMessage?.messageId,
    android: {
      channelId,
      // smallIcon: remoteMessage?.community_logo, // optional, defaults to 'ic_launcher'.
      // pressAction is needed if you want the notification to open the app when pressed
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
      // fullScreenAction: {
      //   id: 'full-screen',
      // },
      // category: AndroidCategory.REMINDER,
      importance: AndroidImportance.HIGH,
    },
  });
}

checkToken();
requestUserPermission();
