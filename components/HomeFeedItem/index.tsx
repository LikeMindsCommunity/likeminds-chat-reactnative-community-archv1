import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import {myClient} from '../..';
import {decode, getFullDate} from '../../commonFuctions';
import {useAppDispatch} from '../../store';
import {getHomeFeedData} from '../../store/actions/homefeed';
import {
  ACCEPT_INVITE,
  ACCEPT_INVITE_SUCCESS,
  REJECT_INVITE_SUCCESS,
  SET_PAGE,
  SHOW_TOAST,
} from '../../store/types/types';
import {styles} from './styles';
import STYLES from '../../constants/Styles';

interface Props {
  avatar: string;
  title: string;
  lastMessage: string;
  time: string;
  pinned: boolean;
  unreadCount: number;
  lastConversation: any;
  navigation: any;
  chatroomID: number;
  lastConvoMember?: string;
  isSecret?: boolean;
  deletedBy?: number;
  inviteReceiver?: any;
  dm_message?: any;
}

const HomeFeedItem: React.FC<Props> = ({
  avatar,
  title,
  lastMessage,
  time,
  pinned = false,
  unreadCount,
  lastConversation,
  navigation,
  chatroomID,
  lastConvoMember,
  isSecret,
  deletedBy,
  inviteReceiver,
  dm_message,
}) => {
  // let dateOrTime = getFullDate(time);
  const dispatch = useAppDispatch();

  const showJoinAlert = () =>
    Alert.alert(
      'Join this chatroom?',
      'You are about to join this secret chatroom.',
      [
        {
          text: 'Cancel',
          // onPress: () => Alert.alert('Cancel Pressed'),
          style: 'default',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            let res = await myClient.inviteAction({
              channel_id: `${chatroomID}`,
              invite_status: 1,
            });
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Invitation accepted'},
            });
            dispatch({type: ACCEPT_INVITE_SUCCESS, body: chatroomID});
            dispatch({type: SET_PAGE, body: 1});
            await dispatch(getHomeFeedData({page: 1}, false) as any);
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
        // cancelable: true,
        // onDismiss: () =>
        //   Alert.alert(
        //     'This alert was dismissed by tapping outside of the alert dialog.',
        //   ),
      },
    );

  const showRejectAlert = () =>
    Alert.alert(
      'Reject Invitation?',
      'Are you sure you want to reject the invitation to join this chatroom?',
      [
        {
          text: 'Cancel',
          // onPress: () => Alert.alert('Cancel Pressed'),
          style: 'default',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            let res = await myClient.inviteAction({
              channel_id: `${chatroomID}`,
              invite_status: 2,
            });
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Invitation rejected'},
            });

            dispatch({type: REJECT_INVITE_SUCCESS, body: chatroomID});
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
        // cancelable: true,
        // onDismiss: () =>
        //   Alert.alert(
        //     'This alert was dismissed by tapping outside of the alert dialog.',
        //   ),
      },
    );

  const getFeedIcon = (val: any) => {
    if (val[0].type === 'pdf') {
      return (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            // marginBottom: -20,
          }}>
          {val?.length > 1 && (
            <Text style={styles.attachment_msg}>{val?.length}</Text>
          )}
          <Image
            source={require('../../assets/images/document_icon3x.png')}
            style={{
              height: 15,
              width: 15,
              resizeMode: 'contain',
              marginRight: 5,
            }}
          />
          <Text style={styles.lastMessage}>
            {val?.length > 1 ? 'Documents' : 'Document'}
          </Text>
        </View>
      );
    } else if (val[0].type === 'video') {
      return (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            // padding:-5
            marginBottom: -2,
          }}>
          {val?.length > 1 && (
            <Text style={styles.attachment_msg}>{val?.length}</Text>
          )}
          <Image
            source={require('../../assets/images/video_icon3x.png')}
            style={{
              height: 15,
              width: 15,
              resizeMode: 'contain',
              marginRight: 5,
            }}
          />
          <Text style={styles.lastMessage}>
            {val?.length > 1 ? 'Videos' : 'Video'}
          </Text>
        </View>
      );
    } else if (val[0].type === 'image') {
      return (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: -2,
          }}>
          {val?.length > 1 && (
            <Text style={styles.attachment_msg}>{val?.length}</Text>
          )}
          <Image
            source={require('../../assets/images/image_icon3x.png')}
            style={{
              height: 15,
              width: 15,
              resizeMode: 'contain',
              marginRight: 5,
            }}
          />
          <Text style={styles.attachment_msg}>
            {val?.length > 1 ? 'Photos' : 'Photo'}
          </Text>
        </View>
      );
    } else {
      return;
    }
  };

  return (
    <Pressable
      onPress={() => {
        navigation.navigate('ChatRoom', {
          chatroomID: chatroomID,
          isInvited: !!inviteReceiver ? true : false,
        });
      }}
      style={({pressed}) => [
        {opacity: pressed ? 0.5 : 1.0},
        styles.itemContainer,
      ]}>
      <View>
        <Image
          source={
            !!avatar
              ? {uri: avatar}
              : require('../../assets/images/default_pic.png')
          }
          style={styles.avatar}
        />
        {dm_message ? (
          <View style={styles.dmAvatarBubble}>
            <Image
              source={require('../../assets/images/dm_message_bubble3x.png')}
              style={styles.dmAvatarBubbleImg}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}

            {isSecret ? (
              <Image
                source={require('../../assets/images/lock_icon3x.png')}
                style={styles.lockIcon}
              />
            ) : null}
          </Text>
          {!!time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
        {!!lastConversation && !!!inviteReceiver ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {!!deletedBy ? (
              <Text
                style={
                  styles.deletedMessage
                }>{`This message has been deleted`}</Text>
            ) : (
              <Text>
                {!!lastConvoMember ? (
                  <Text
                    style={styles.lastMessage}>{`${lastConvoMember}: `}</Text>
                ) : null}

                <Text>
                  {!!lastConversation?.has_files
                    ? getFeedIcon(lastConversation?.attachments)
                    : decode(lastMessage, false)}
                </Text>
              </Text>
            )}
          </Text>
        ) : !!inviteReceiver ? (
          <Text
            style={
              styles.lastMessage
            }>{`${`Member`} invited you to join `}</Text>
        ) : null}
      </View>
      {!!!lastConversation && !!inviteReceiver ? (
        <View style={{display: 'flex', flexDirection: 'row', gap: 10}}>
          <TouchableOpacity
            onPress={() => {
              showRejectAlert();
            }}
            style={styles.inviteIcon}>
            <Image
              style={styles.lockIcon}
              source={require('../../assets/images/invite_cross3x.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              showJoinAlert();
            }}
            style={[styles.inviteIcon, {borderColor: '#5046E5'}]}>
            <Image
              style={styles.lockIcon}
              source={require('../../assets/images/invite_tick3x.png')}
            />
          </TouchableOpacity>
        </View>
      ) : null}
      {/* {pinned && <View style={styles.pinned} />} */}
      {!!unreadCount
        ? unreadCount > 0 && (
            <View style={styles.unreadCountContainer}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )
        : null}
    </Pressable>
  );
};

export default HomeFeedItem;
