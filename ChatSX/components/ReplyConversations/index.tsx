import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import React, {useEffect} from 'react';
import STYLES from '../../constants/Styles';
import {styles} from './styles';
import {decode} from '../../commonFuctions';
import {useAppDispatch, useAppSelector} from '../../../store';
import {
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
} from '../../store/types/types';
import {
  AUDIO_TEXT,
  IMAGE_TEXT,
  PDF_TEXT,
  VIDEO_TEXT,
} from '../../constants/Strings';
import AttachmentConversations from '../AttachmentConversations';
import {Events, Keys} from '../../enums';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';

interface ReplyConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
  onScrollToIndex: any;
  openKeyboard: any;
  longPressOpenKeyboard: any;
  reactionArr: any;
  navigation: any;
  handleFileUpload: any;
  chatroomID: any;
}

interface ReplyBox {
  item: any;
  isIncluded: boolean;
}

export const ReplyBox = ({item, isIncluded}: ReplyBox) => {
  const {user} = useAppSelector(state => state.homefeed);

  return (
    <View style={styles.replyBox}>
      <View>
        <Text style={styles.replySender}>
          {item?.member?.id == user?.id ? 'You' : item?.member?.name}
        </Text>
      </View>
      <View style={styles.alignRow}>
        {!!item?.hasFiles ? (
          item?.attachments[0]?.type === IMAGE_TEXT ? (
            <Image
              source={require('../../assets/images/image_icon3x.png')}
              style={styles.icon}
            />
          ) : item?.attachments[0]?.type === PDF_TEXT ? (
            <Image
              source={require('../../assets/images/document_icon3x.png')}
              style={styles.icon}
            />
          ) : item?.attachments[0]?.type === VIDEO_TEXT ? (
            <Image
              source={require('../../assets/images/video_icon3x.png')}
              style={styles.icon}
            />
          ) : null
        ) : null}
        <Text style={styles.messageText}>
          {decode(
            !!item?.answer
              ? item?.answer
              : item?.attachments[0]?.type === PDF_TEXT
              ? `Document`
              : item?.attachments[0]?.type === IMAGE_TEXT
              ? `Photo`
              : item?.attachments[0]?.type === VIDEO_TEXT
              ? `Video`
              : item?.attachments[0]?.type === AUDIO_TEXT
              ? `This message is not supported in this app yet.`
              : null,
            false,
          )}
        </Text>
        {!!item?.hasFiles && item?.attachments.length > 1 ? (
          <View>
            <Text style={styles.messageText}>{` (+${
              item?.attachments.length - 1
            } more)`}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const ReplyConversations = ({
  isIncluded,
  item,
  isTypeSent,
  onScrollToIndex,
  openKeyboard,
  longPressOpenKeyboard,
  reactionArr,
  navigation,
  handleFileUpload,
  chatroomID,
}: ReplyConversations) => {
  const dispatch = useAppDispatch();
  const {conversations, selectedMessages, stateArr, isLongPress}: any =
    useAppSelector(state => state.chatroom);
  const {user} = useAppSelector(state => state.homefeed);

  const handleLongPress = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    longPressOpenKeyboard();
  };

  const handleOnPress = () => {
    let isStateIncluded = stateArr.includes(item?.state);
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !stateArr.includes(val?.state),
        );
        if (filterdMessages.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({type: LONG_PRESSED, body: false});
        }
      } else {
        let selectedKey;
        if (selectedMessages[0]?.attachmentCount > 0) {
          selectedKey = selectedMessages[0]?.attachments[0]?.type;
        } else {
          selectedKey = 'text';
        }
        LMChatAnalytics.track(
          Events.MESSAGE_SELECTED,
          new Map<string, string>([
            [Keys.TYPE, selectedKey],
            [Keys.CHATROOM_ID, chatroomID.toString()],
          ]),
        );
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else {
      let index = conversations.findIndex(
        (element: any) => element?.id === item?.replyConversationObject?.id,
      );
      if (index >= 0) {
        onScrollToIndex(index);
      }
    }
  };
  return (
    <View
      style={[
        styles.displayRow,
        {
          justifyContent: isTypeSent ? 'flex-end' : 'flex-start',
        },
      ]}>
      <View
        style={[
          styles.replyMessage,
          isTypeSent ? styles.sentMessage : styles.receivedMessage,
          isIncluded ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE} : null,
        ]}>
        {/* Reply conversation message sender name */}
        {!!(item?.member?.id == user?.id) ? null : (
          <Text style={styles.messageInfo} numberOfLines={1}>
            {item?.member?.name}
            {!!item?.member?.customTitle ? (
              <Text
                style={
                  styles.messageCustomTitle
                }>{` • ${item?.member?.customTitle}`}</Text>
            ) : null}
          </Text>
        )}
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={handleOnPress}>
          <ReplyBox
            isIncluded={isIncluded}
            item={item?.replyConversationObject}
          />
        </TouchableOpacity>
        {item?.attachmentCount > 0 ? (
          <AttachmentConversations
            isReplyConversation={true}
            navigation={navigation}
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
            openKeyboard={() => {
              openKeyboard();
            }}
            longPressOpenKeyboard={() => {
              longPressOpenKeyboard();
            }}
            handleFileUpload={handleFileUpload}
            isReply={true}
          />
        ) : (
          <View>
            <View style={styles.messageText as any}>
              {decode(item?.answer, true)}
            </View>
            <View style={styles.alignTime}>
              {item?.isEdited ? (
                <Text style={styles.messageDate}>{`Edited • `}</Text>
              ) : null}
              <Text style={styles.messageDate}>{item?.createdAt}</Text>
            </View>
          </View>
        )}
      </View>
      {(reactionArr.length > 0 || item?.answer?.split('').length > 100) &&
      !isTypeSent ? (
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={event => {
            const {pageX, pageY} = event.nativeEvent;
            dispatch({
              type: SET_POSITION,
              body: {pageX: pageX, pageY: pageY},
            });
            openKeyboard();
          }}>
          <Image
            style={{
              height: 25,
              width: 25,
              resizeMode: 'contain',
            }}
            source={require('../../assets/images/add_more_emojis3x.png')}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

export default ReplyConversations;
