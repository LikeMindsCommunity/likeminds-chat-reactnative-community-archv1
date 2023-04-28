import {View, Text, Image, TouchableOpacity, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {decode} from '../../commonFuctions';
import ReplyConversations from '../ReplyConversations';
import AttachmentConversations from '../AttachmentConversations';
import ReactionGridModal from '../ReactionGridModal';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  LONG_PRESSED,
  SELECTED_MESSAGES,
  SET_POSITION,
} from '../../store/types/types';

interface Messages {
  item: any;
  isIncluded: boolean;
  onScrollToIndex: any;
  navigation: any;
  openKeyboard: any;
  longPressOpenKeyboard: any;
  removeReaction: any;
  handleTapToUndo: any;
}

const Messages = ({
  item,
  isIncluded,
  onScrollToIndex,
  navigation,
  openKeyboard,
  longPressOpenKeyboard,
  removeReaction,
  handleTapToUndo,
}: Messages) => {
  const {user} = useAppSelector(state => state.homefeed);
  const {
    selectedMessages,
    isLongPress,
    stateArr,
    conversations,
    chatroomDetails,
  } = useAppSelector(state => state.chatroom);

  const [selectedReaction, setSelectedReaction] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [reactionArr, setReactionArr] = useState([] as any);
  const isTypeSent = item?.member?.id === user?.id ? true : false;
  const chatRequestedBy = chatroomDetails?.chatroom?.chat_requested_by;
  const isItemIncludedInStateArr = stateArr.includes(item?.state);

  const dispatch = useAppDispatch();
  let defaultReactionArrLen = item?.reactions?.length;

  //this useEffect update setReactionArr in format of { reaction: 👌, memberArr: []}
  useEffect(() => {
    let tempArr = [] as any;
    if (defaultReactionArrLen === 0) {
      setReactionArr([]);
    }
    for (let i = 0; i < defaultReactionArrLen; i++) {
      if (defaultReactionArrLen > 0) {
        let isIncuded = tempArr.some(
          (val: any) => val['reaction'] === item?.reactions[i]?.reaction,
        );
        if (isIncuded) {
          let index = tempArr.findIndex(
            (val: any) => val['reaction'] === item?.reactions[i]?.reaction,
          );
          tempArr[index].memberArr = [
            ...tempArr[index]?.memberArr,
            item?.reactions[i]?.member,
          ];
          setReactionArr([...tempArr] as any);
        } else {
          let obj = {
            reaction: item?.reactions[i]?.reaction,
            memberArr: [item?.reactions[i]?.member],
          };
          tempArr = [...tempArr, obj];
          setReactionArr([...tempArr] as any);
        }
      }
    }
  }, [item?.reactions]);

  const reactionLen = reactionArr.length;

  // function handles event on longPress action on a message
  const handleLongPress = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    longPressOpenKeyboard();
  };

  // function handles event on Press action on a message
  const handleOnPress = (event: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    openKeyboard();
  };

  // function handles event on Press reaction below a message
  const handleReactionOnPress = (event: any, val?: any) => {
    const {pageX, pageY} = event.nativeEvent;
    dispatch({
      type: SET_POSITION,
      body: {pageX: pageX, pageY: pageY},
    });
    let isStateIncluded = stateArr.includes(item?.state);
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !isStateIncluded,
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
      setSelectedReaction(val);
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.messageParent}>
      <View>
        {!!item?.deleted_by ? (
          <View
            style={[
              styles.message,
              isTypeSent ? styles.sentMessage : styles.receivedMessage,
              isIncluded
                ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE}
                : null,
            ]}>
            <Text style={styles.deletedMsg}>This message has been deleted</Text>
          </View>
        ) : !!item?.reply_conversation_object ? (
          <ReplyConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
            onScrollToIndex={onScrollToIndex}
            openKeyboard={() => {
              openKeyboard();
            }}
            longPressOpenKeyboard={() => {
              longPressOpenKeyboard();
            }}
            reactionArr={reactionArr}
          />
        ) : item?.attachment_count > 0 ? (
          <AttachmentConversations
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
          />
        ) : (
          <View>
            {isItemIncludedInStateArr ? (
              <View>
                {/* state 19 is for the reject DM state message */}
                {item.state === 19 &&
                conversations[0].state === 19 &&
                conversations[0]?.id === item?.id &&
                (!!chatRequestedBy
                  ? chatRequestedBy[0]?.id === user?.id
                  : null) ? (
                  <Pressable
                    onPress={() => {
                      handleTapToUndo();
                    }}
                    style={[styles.statusMessage]}>
                    <Text
                      style={{
                        color: STYLES.$COLORS.PRIMARY,
                        fontFamily: STYLES.$FONT_TYPES.LIGHT,
                      }}>{`${item?.answer} Tap to undo.`}</Text>
                  </Pressable>
                ) : (
                  <View style={[styles.statusMessage]}>
                    <Text>{decode(item?.answer, true)}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View
                style={[
                  styles.alignMessage,
                  {
                    justifyContent: isTypeSent ? 'flex-end' : 'flex-start',
                  },
                ]}>
                <View
                  style={[
                    styles.message,
                    isTypeSent ? styles.sentMessage : styles.receivedMessage,
                    isIncluded
                      ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE}
                      : null,
                  ]}>
                  {!!(item?.member?.id === user?.id) ? null : (
                    <Text style={styles.messageInfo} numberOfLines={1}>
                      {item?.member?.name}
                      {!!item?.member?.custom_title ? (
                        <Text
                          style={
                            styles.messageCustomTitle
                          }>{` • ${item?.member?.custom_title}`}</Text>
                      ) : null}
                    </Text>
                  )}
                  <Text>{decode(item?.answer, true)}</Text>
                  <Text style={styles.messageDate}>{item?.created_at}</Text>
                </View>
                {(reactionArr.length > 0 ||
                  item?.answer?.split('').length > 100) &&
                !isTypeSent ? (
                  <Pressable
                    onLongPress={handleLongPress}
                    delayLongPress={200}
                    onPress={handleOnPress}>
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
            )}
          </View>
        )}

        {!isItemIncludedInStateArr ? (
          <View>
            {isTypeSent ? (
              <View
                style={[
                  styles.typeSent,
                  isIncluded
                    ? {
                        borderBottomColor: STYLES.$COLORS.SELECTED_BLUE,
                        borderLeftColor: STYLES.$COLORS.SELECTED_BLUE,
                      }
                    : null,
                ]}
              />
            ) : (
              <View
                style={[
                  styles.typeReceived,
                  isIncluded
                    ? {
                        borderBottomColor: STYLES.$COLORS.SELECTED_BLUE,
                        borderRightColor: STYLES.$COLORS.SELECTED_BLUE,
                      }
                    : null,
                ]}
              />
            )}
          </View>
        ) : null}
      </View>

      {!item?.deleted_by ? (
        reactionLen > 0 && reactionLen <= 2 ? (
          <View
            style={[
              isTypeSent
                ? styles.reactionSentParent
                : styles.reactionReceivedParent,
            ]}>
            {reactionArr.map((val: any, index: any) => (
              <TouchableOpacity
                onLongPress={handleLongPress}
                delayLongPress={200}
                onPress={event => {
                  handleReactionOnPress(event, val?.reaction);
                }}
                style={[
                  styles.reaction,
                  isIncluded
                    ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE}
                    : {backgroundColor: 'white'},
                ]}
                key={val + index}>
                <Text>{val?.reaction}</Text>
                <Text style={styles.messageText}>{val?.memberArr?.length}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : reactionLen > 2 ? (
          <View
            style={
              isTypeSent
                ? styles.reactionSentParent
                : styles.reactionReceivedParent
            }>
            <TouchableOpacity
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={event => {
                handleReactionOnPress(event, reactionArr[0]?.reaction);
              }}
              style={[
                styles.reaction,
                isIncluded
                  ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE}
                  : {backgroundColor: 'white'},
              ]}>
              <Text>{reactionArr[0]?.reaction}</Text>
              <Text style={styles.messageText}>
                {reactionArr[0]?.memberArr?.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={event => {
                handleReactionOnPress(event, reactionArr[1]?.reaction);
              }}
              style={[
                styles.reaction,
                isIncluded
                  ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE}
                  : {backgroundColor: 'white'},
              ]}>
              <Text>{reactionArr[1]?.reaction}</Text>
              <Text style={styles.messageText}>
                {reactionArr[1]?.memberArr?.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onLongPress={handleLongPress}
              delayLongPress={200}
              onPress={event => {
                handleReactionOnPress(event, null);
              }}
              style={[
                styles.moreReaction,
                isIncluded
                  ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE}
                  : {backgroundColor: STYLES.$COLORS.TERTIARY},
              ]}>
              <View>
                <Image
                  style={{
                    height: 20,
                    width: 20,
                    resizeMode: 'contain',
                  }}
                  source={require('../../assets/images/more_dots3x.png')}
                />
              </View>
            </TouchableOpacity>
          </View>
        ) : null
      ) : null}

      <ReactionGridModal
        defaultReactionArr={item?.reactions}
        reactionArr={reactionArr}
        modalVisible={modalVisible}
        selectedReaction={selectedReaction}
        setModalVisible={val => {
          setModalVisible(val);
        }}
        removeReaction={() => {
          removeReaction();
          setModalVisible(false);
        }}
      />
    </View>
  );
};

export default Messages;
