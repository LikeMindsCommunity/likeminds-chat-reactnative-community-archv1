import {View, Text, Image, TouchableOpacity, Pressable} from 'react-native';
import React, {useState} from 'react';
import STYLES from '../../constants/Styles';
import {styles} from './styles';
import {decode, generateGifString} from '../../commonFuctions';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  GET_CONVERSATIONS_SUCCESS,
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
} from '../../store/types/types';
import {
  AUDIO_TEXT,
  CAPITAL_GIF_TEXT,
  DOCUMENT_STRING,
  GIF_TEXT,
  IMAGE_TEXT,
  NOT_SUPPORTED_TEXT,
  PDF_TEXT,
  PHOTO_STRING,
  VIDEO_STRING,
  VIDEO_TEXT,
  VOICE_NOTE_STRING,
  VOICE_NOTE_TEXT,
} from '../../constants/Strings';
import AttachmentConversations from '../AttachmentConversations';
import {getCurrentConversation} from '../../utils/chatroomUtils';

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
  chatroomName: string;
}

interface ReplyBox {
  item: any;
  isIncluded?: boolean;
  chatroomName: string;
}

export const ReplyBox = ({item, chatroomName}: ReplyBox) => {
  const {user} = useAppSelector(state => state.homefeed);
  const isGif = item?.attachments[0]?.type === GIF_TEXT ? true : false;
  const answer = isGif ? generateGifString(item?.answer) : item?.answer;
  return (
    <View style={styles.replyBox}>
      <View>
        <Text style={styles.replySender}>
          {item?.member?.id == user?.id ? 'You' : item?.member?.name}
        </Text>
      </View>
      <View style={styles.alignRow}>
        {item?.hasFiles ? (
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
          ) : item?.attachments[0]?.type === VOICE_NOTE_TEXT ? (
            <Image
              source={require('../../assets/images/mic_icon3x.png')}
              style={[styles.icon, {tintColor: 'grey'}]}
            />
          ) : item?.attachments[0]?.type === GIF_TEXT ? (
            <View style={styles.gifView}>
              <Text style={styles.gifText}>{CAPITAL_GIF_TEXT}</Text>
            </View>
          ) : Number(item?.state) === 10 ? (
            <Image
              source={require('../../assets/images/poll_icon3x.png')}
              style={[styles.icon, {tintColor: 'grey'}]}
            />
          ) : item?.ogTags?.url != null ? (
            <Image
              source={require('../../assets/images/link_icon.png')}
              style={[styles.icon, {tintColor: 'grey'}]}
            />
          ) : null
        ) : null}
        <Text style={styles.messageText}>
          {decode(
            !!answer
              ? answer
              : item?.attachments[0]?.type === PDF_TEXT
              ? DOCUMENT_STRING
              : item?.attachments[0]?.type === IMAGE_TEXT
              ? PHOTO_STRING
              : item?.attachments[0]?.type === VIDEO_TEXT
              ? VIDEO_STRING
              : item?.attachments[0]?.type === VOICE_NOTE_TEXT
              ? VOICE_NOTE_STRING
              : item?.attachments[0]?.type === GIF_TEXT
              ? CAPITAL_GIF_TEXT
              : item?.attachments[0]?.type === AUDIO_TEXT
              ? NOT_SUPPORTED_TEXT
              : null,
            false,
            chatroomName,
            user?.sdkClientInfo?.community,
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
  chatroomName,
}: ReplyConversations) => {
  const dispatch = useAppDispatch();
  const {conversations, selectedMessages, stateArr, isLongPress}: any =
    useAppSelector(state => state.chatroom);
  const {user} = useAppSelector(state => state.homefeed);
  const [flashListMounted, setFlashListMounted] = useState(false);

  const handleLongPress = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    longPressOpenKeyboard();
  };

  const handleOnPress = async () => {
    const isStateIncluded = stateArr.includes(item?.state);
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
      const index = conversations.findIndex(
        (element: any) => element?.id == item?.replyConversationObject?.id,
      );
      if (index >= 0) {
        if (!flashListMounted) {
          setTimeout(() => {
            onScrollToIndex(index);
            setFlashListMounted(true);
          }, 1000);
        } else {
          onScrollToIndex(index);
        }
      } else {
        const newConversation = await getCurrentConversation(
          item?.replyConversationObject,
          chatroomID?.toString(),
        );
        dispatch({
          type: GET_CONVERSATIONS_SUCCESS,
          body: {conversations: newConversation},
        });
        const index = newConversation.findIndex(
          element => element?.id == item?.replyConversationObject?.id,
        );
        if (index >= 0) {
          onScrollToIndex(index);
        }
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
        {item?.member?.id == user?.id ? null : (
          <Text style={styles.messageInfo} numberOfLines={1}>
            {item?.member?.name}
            {item?.member?.customTitle ? (
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
            chatroomName={chatroomName}
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
            chatroomName={chatroomName}
          />
        ) : (
          <View>
            <View style={styles.messageText as any}>
              {decode(
                item?.answer,
                true,
                chatroomName,
                user?.sdkClientInfo?.community,
              )}
            </View>
            <View style={styles.alignTime}>
              {item?.isEdited ? (
                <Text style={styles.messageDate}>{'Edited • '}</Text>
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
