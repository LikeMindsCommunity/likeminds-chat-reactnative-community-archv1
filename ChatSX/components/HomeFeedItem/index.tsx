import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import {myClient} from '../../..';
import {decode, getFullDate} from '../../commonFuctions';
import {useAppDispatch} from '../../../store';
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
import {CHATROOM} from '../../constants/Screens';
import {
  CANCEL_BUTTON,
  CONFIRM_BUTTON,
  IMAGE_TEXT,
  PDF_TEXT,
  VIDEO_TEXT,
} from '../../constants/Strings';
import Layout from '../../constants/Layout';

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
  lastConversationMember?: string;
  isSecret: boolean;
  deletedBy?: number;
  inviteReceiver?: any;
  chatroomType: number;
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
  lastConversationMember,
  isSecret,
  deletedBy,
  inviteReceiver,
  chatroomType,
}) => {
  const dispatch = useAppDispatch();

  const showJoinAlert = () =>
    Alert.alert(
      'Join this chatroom?',
      'You are about to join this secret chatroom.',
      [
        {
          text: CANCEL_BUTTON,
          style: 'default',
        },
        {
          text: CONFIRM_BUTTON,
          onPress: async () => {
            let res = await myClient?.inviteAction({
              channelId: `${chatroomID}`,
              inviteStatus: 1,
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
      },
    );

  const showRejectAlert = () =>
    Alert.alert(
      'Reject Invitation?',
      'Are you sure you want to reject the invitation to join this chatroom?',
      [
        {
          text: CANCEL_BUTTON,
          style: 'default',
        },
        {
          text: CONFIRM_BUTTON,
          onPress: async () => {
            let res = await myClient?.inviteAction({
              channelId: `${chatroomID}`,
              inviteStatus: 2,
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
      },
    );

  const getFeedIconAttachment = (val: any) => {
    let imageCount = val?.images?.length;
    let videosCount = val?.videos?.length;
    let pdfCount = val?.pdf?.length;

    if (imageCount > 0 && videosCount > 0 && pdfCount > 0) {
      return (
        <View style={styles.alignCenter}>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{imageCount}</Text>
            <Image
              source={require('../../assets/images/image_icon3x.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{videosCount}</Text>
            <Image
              source={require('../../assets/images/video_icon3x.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{pdfCount}</Text>
            <Image
              source={require('../../assets/images/document_icon3x.png')}
              style={styles.icon}
            />
          </View>
        </View>
      );
    } else if (imageCount > 0 && videosCount > 0) {
      return (
        <View style={styles.alignCenter}>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{imageCount}</Text>
            <Image
              source={require('../../assets/images/image_icon3x.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{videosCount}</Text>
            <Image
              source={require('../../assets/images/video_icon3x.png')}
              style={styles.icon}
            />
          </View>
        </View>
      );
    } else if (videosCount > 0 && pdfCount > 0) {
      return (
        <View style={styles.alignCenter}>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{videosCount}</Text>
            <Image
              source={require('../../assets/images/video_icon3x.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{pdfCount}</Text>
            <Image
              source={require('../../assets/images/document_icon3x.png')}
              style={styles.icon}
            />
          </View>
        </View>
      );
    } else if (imageCount > 0 && pdfCount > 0) {
      return (
        <View style={styles.alignCenter}>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{imageCount}</Text>
            <Image
              source={require('../../assets/images/image_icon3x.png')}
              style={styles.icon}
            />
          </View>
          <View style={styles.alignCenter}>
            <Text style={styles.attachment_msg}>{pdfCount}</Text>
            <Image
              source={require('../../assets/images/document_icon3x.png')}
              style={styles.icon}
            />
          </View>
        </View>
      );
    } else if (pdfCount > 0) {
      return (
        <View style={[styles.alignCenter]}>
          {pdfCount > 1 && (
            <Text style={styles.attachment_msg}>{pdfCount}</Text>
          )}
          <Image
            source={require('../../assets/images/document_icon3x.png')}
            style={styles.icon}
          />
          <Text style={styles.attachment_msg}>
            {pdfCount > 1 ? 'Documents' : 'Document'}
          </Text>
        </View>
      );
    } else if (videosCount > 0) {
      return (
        <View
          style={[
            styles.alignCenter,
            {
              marginBottom: -2,
            },
          ]}>
          {videosCount > 1 && (
            <Text style={styles.attachment_msg}>{videosCount}</Text>
          )}
          <Image
            source={require('../../assets/images/video_icon3x.png')}
            style={styles.icon}
          />
          <Text style={styles.lastMessage}>
            {videosCount > 1 ? 'Videos' : 'Video'}
          </Text>
        </View>
      );
    } else if (imageCount > 0) {
      return (
        <View
          style={[
            styles.alignCenter,
            {
              marginBottom: -2,
            },
          ]}>
          {imageCount > 1 && (
            <Text style={styles.attachment_msg}>{imageCount}</Text>
          )}
          <Image
            source={require('../../assets/images/image_icon3x.png')}
            style={styles.icon}
          />
          <Text style={styles.attachment_msg}>
            {imageCount > 1 ? 'Photos' : 'Photo'}
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
        navigation.navigate(CHATROOM, {
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
        {chatroomType === 10 ? (
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
          <Text
            numberOfLines={1}
            style={[
              styles.parentLastMessage,
              {
                width: '80%',
              },
            ]}>
            {!!deletedBy ? (
              <Text
                style={
                  styles.deletedMessage
                }>{`This message has been deleted`}</Text>
            ) : (
              <Text
                style={[
                  styles.alignCenter,
                  {
                    width: Layout.window.width - 130,
                    overflow: 'hidden',
                  },
                ]}>
                {chatroomType !== 10 ? (
                  <Text
                    style={
                      styles.lastMessage
                    }>{`${lastConversationMember}: `}</Text>
                ) : null}

                <Text numberOfLines={1} style={[styles.parentLastMessage]}>
                  {!!lastConversation?.has_files
                    ? getFeedIconAttachment(lastConversation)
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
