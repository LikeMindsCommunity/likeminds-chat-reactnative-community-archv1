import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidGroupAlertBehavior,
  AndroidImportance,
  EventType,
} from '@notifee/react-native';
import React from 'react';
import {decodeForNotifications, generateGifString} from '../commonFuctions';
import {Platform} from 'react-native';
import {getRoute} from './routes';
import {myClient} from '../..';

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
  const isIOS = Platform.OS === 'ios' ? true : false;
  const message = isIOS
    ? generateGifString(remoteMessage?.notification?.body)
    : generateGifString(remoteMessage?.data?.sub_title);
  const channelId = await notifee.createChannel({
    id: 'important',
    name: 'Important Notifications',
    importance: AndroidImportance.HIGH,
  });

  let decodedAndroidMsg;
  let decodedIOSMsg;
  if (isIOS) {
    decodedIOSMsg = decodeForNotifications(message);
  } else {
    decodedAndroidMsg = decodeForNotifications(message);
  }

  const route = await getRoute(remoteMessage?.data?.route);
  const routeGot = route?.params?.navigationRoute;

  if (routeGot === 'collabcard' && routeGot) {
    const response = await myClient?.getUnreadConversationNotification();
    if (response?.success === false) {
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
    } else {
      const unreadConversation = response?.data?.unreadConversation;
      const sortedUnreadConversation = unreadConversation?.sort(
        (a: any, b: any) =>
          b.chatroomLastConversationTimestamp -
          a.chatroomLastConversationTimestamp,
      );
      let totalCount = 0;
      for (const obj of sortedUnreadConversation) {
        if (obj.hasOwnProperty('chatroomUnreadConversationCount')) {
          totalCount += obj.chatroomUnreadConversationCount;
        }
      }

      // Create summary
      notifee.displayNotification({
        title: 'Emails',
        subtitle: `${totalCount} messages from ${sortedUnreadConversation?.length} chatrooms`,
        android: {
          channelId,
          groupSummary: true,
          groupId: '123',
          groupAlertBehavior: AndroidGroupAlertBehavior.SUMMARY,
        },
        id: 'group',
      });

      // Children
      for (let i = 0; i < sortedUnreadConversation.length; i++) {
        notifee.displayNotification({
          title: sortedUnreadConversation[i]?.chatroomName,
          body: `<b>${sortedUnreadConversation[i]?.chatroomLastConversationUserName}</b>: ${sortedUnreadConversation[i]?.chatroomLastConversation}`,
          android: {
            channelId,
            groupId: '123',
            groupAlertBehavior: AndroidGroupAlertBehavior.SUMMARY,
            timestamp:
              sortedUnreadConversation[i]?.chatroomLastConversationTimestamp *
                1000 ?? Date.now(),
            showTimestamp: true,
            sortKey: i?.toString(),
          },
          id: sortedUnreadConversation[i]?.chatroomId?.toString(),
        });
      }
    }
  }
}
