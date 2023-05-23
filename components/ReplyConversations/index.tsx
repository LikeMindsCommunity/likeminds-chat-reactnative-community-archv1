import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import React from 'react';
import STYLES from '../../constants/Styles';
import {styles} from './styles';
import {decode} from '../../commonFuctions';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
} from '../../store/types/types';

interface ReplyConversations {
  item: any;
  isTypeSent: boolean;
  isIncluded: boolean;
  onScrollToIndex: any;
  openKeyboard: any;
  longPressOpenKeyboard: any;
  reactionArr: any;
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
          {item?.member?.id === user?.id ? 'You' : item?.member?.name}
        </Text>
      </View>
      <View style={styles.alignRow}>
        {!!item?.has_files ? (
          item?.attachments[0]?.type === 'image' ? (
            <Image
              source={require('../../assets/images/image_icon3x.png')}
              style={styles.icon}
            />
          ) : item?.attachments[0]?.type === 'pdf' ? (
            <Image
              source={require('../../assets/images/document_icon3x.png')}
              style={styles.icon}
            />
          ) : item?.attachments[0]?.type === 'video' ? (
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
              : item?.attachments[0]?.type === 'pdf'
              ? `Document`
              : item?.attachments[0]?.type === 'image'
              ? `Photo`
              : item?.attachments[0]?.type === 'video'
              ? `Video`
              : item?.attachments[0]?.type === 'audio'
              ? `This message is not supported in this app yet.`
              : null,
            false,
          )}
        </Text>
        {!!item?.has_files && item?.attachments.length > 1 ? (
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
}: ReplyConversations) => {
  const dispatch = useAppDispatch();
  const {conversations, selectedMessages, stateArr, isLongPress}: any =
    useAppSelector(state => state.chatroom);

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
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else {
      let index = conversations.findIndex(
        (element: any) => element?.id === item?.reply_conversation_object?.id,
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
        <TouchableOpacity
          onLongPress={handleLongPress}
          delayLongPress={200}
          onPress={handleOnPress}>
          <ReplyBox
            isIncluded={isIncluded}
            item={item?.reply_conversation_object}
          />
        </TouchableOpacity>
        <View style={styles.messageText as any}>
          {decode(item?.answer, true)}
        </View>
        <Text style={styles.messageDate}>{item?.created_at}</Text>
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
