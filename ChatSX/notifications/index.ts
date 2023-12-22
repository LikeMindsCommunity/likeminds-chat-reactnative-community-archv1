import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidGroupAlertBehavior,
  AndroidImportance,
  AndroidLaunchActivityFlag,
  EventType,
} from '@notifee/react-native';
import React from 'react';
import {
  decodeForNotifications,
  generateGifString,
  getNotificationsMessage,
} from '../commonFuctions';
import {Platform} from 'react-native';
import {getRoute} from './routes';
import {myClient} from '../..';
import {Credentials} from '../credentials';
import {ChatroomData} from './models';

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
  const users = await myClient?.getUserSchema();
  Credentials.setCredentials(users?.userName, users?.userUniqueID);
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

  if (!remoteMessage?.data?.route) {
    return;
  }

  const route = await getRoute(remoteMessage?.data?.route);
  const navigationRoute = route?.params?.navigationRoute;

  if (navigationRoute === 'collabcard' && navigationRoute) {
    const UUID =
      Credentials.userUniqueId.length > 0
        ? Credentials.userUniqueId
        : users?.userUniqueID;
    const userName =
      Credentials.username.length > 0 ? Credentials.username : users?.username;

    const payload = {
      uuid: UUID, // uuid
      userName: userName, // user name
      isGuest: false,
    };

    if (isIOS) {
      await notifee.displayNotification({
        title: remoteMessage?.data?.title,
        body: isIOS ? decodedIOSMsg : decodedAndroidMsg,
        data: remoteMessage?.data,
        id: remoteMessage?.messageId,
        android: {
          channelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
          importance: AndroidImportance.HIGH,
        },
      });
    } else {
      const res = await myClient.initiateUser(payload);
      if (res?.success === true) {
        const response = await myClient?.getUnreadConversationNotification();
        if (response?.success === false) {
          await notifee.displayNotification({
            title: remoteMessage?.data?.title,
            body: decodedAndroidMsg,
            data: remoteMessage?.data,
            id: remoteMessage?.messageId,
            android: {
              channelId,
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
            (a: ChatroomData, b: ChatroomData) => {
              return (
                b?.chatroomLastConversationTimestamp -
                a?.chatroomLastConversationTimestamp
              );
            },
          );
          let totalCount = 0;
          for (const obj of sortedUnreadConversation) {
            if (obj.hasOwnProperty('chatroomUnreadConversationCount')) {
              totalCount += obj.chatroomUnreadConversationCount;
            }
          }

          // Create summary
          notifee.displayNotification({
            title: navigationRoute,
            subtitle: `${totalCount} messages from ${sortedUnreadConversation?.length} chatrooms`,
            android: {
              channelId,
              groupSummary: true,
              groupId: navigationRoute?.toString(16),
              groupAlertBehavior: AndroidGroupAlertBehavior.SUMMARY,
              pressAction: {
                id: 'default',
                launchActivity: 'default',
                launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
              },
            },
            id: 'group',
          });

          // Children
          for (let i = 0; i < sortedUnreadConversation.length; i++) {
            const convertedGifString = generateGifString(
              sortedUnreadConversation[i]?.chatroomLastConversation,
            );

            const decodedMessage = convertedGifString
              ? decodeForNotifications(convertedGifString)
              : '';

            const message = getNotificationsMessage(
              sortedUnreadConversation[i]?.attachments,
              decodedMessage,
            );

            notifee.displayNotification({
              title: sortedUnreadConversation[i]?.chatroomName,
              body: `<b>${sortedUnreadConversation[i]?.chatroomLastConversationUserName}</b>: ${message}`,
              android: {
                channelId,
                groupId: navigationRoute?.toString(16),
                groupAlertBehavior: AndroidGroupAlertBehavior.SUMMARY,
                timestamp:
                  sortedUnreadConversation[i]
                    ?.chatroomLastConversationTimestamp * 1000 ?? Date.now(),
                showTimestamp: true,
                sortKey: i?.toString(),
                pressAction: {
                  id: 'default',
                  launchActivity: 'default',
                  launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
                },
              },
              data: {route: sortedUnreadConversation[i]?.routeChild},
              id: sortedUnreadConversation[i]?.chatroomId?.toString(),
            });
          }
        }
      }
    }
  }
}
