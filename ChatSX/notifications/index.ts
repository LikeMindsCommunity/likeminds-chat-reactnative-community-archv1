import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import React from 'react';
import {decodeForNotifications} from '../commonFuctions';
import {Platform} from 'react-native';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
}

export const fetchFCMToken = async () => {
  const fcmToken = await messaging().getToken();
  return fcmToken;
};

export default async function getNotification(remoteMessage: any) {
  const channelId = await notifee.createChannel({
    id: 'important',
    name: 'Important Notifications',
    importance: AndroidImportance.HIGH,
  });

  let isIOS = Platform.OS === 'ios' ? true : false;
  let decodedAndroidMsg;
  let decodedIOSMsg;
  if (isIOS) {
    decodedIOSMsg = decodeForNotifications(remoteMessage?.notification?.body);
  } else {
    decodedAndroidMsg = decodeForNotifications(remoteMessage?.data?.sub_title);
  }
  await notifee.displayNotification({
    title: remoteMessage?.data?.title,
    body: isIOS ? decodedIOSMsg : decodedAndroidMsg,
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
      importance: AndroidImportance.HIGH,
    },
  });
}
