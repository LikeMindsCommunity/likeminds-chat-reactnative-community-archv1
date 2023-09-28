import React from 'react';
import {View, Text, Pressable} from 'react-native';
import Messages from '../../components/Messages';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../../store';
import STYLES from '../../constants/Styles';
import {SET_POSITION} from '../../store/types/types';

// Import your Messages component here

interface MessageItem {
  item: any;
  isStateIncluded: any;
  isIncluded: any;
  handleLongPress: any;
  handleClick: any;
  chatroomType: any;
  navigation: any;
  openKeyboard: any;
  onScrollToIndex: any;
  removeReaction: any;
  onTapToUndo: any;
  handleFileUpload: any;
  index: any;
  conversations: any;
  selectedMessages: any;
  flatlistRef: any;
}

const MessageListItem = ({
  item,
  isStateIncluded,
  isIncluded,
  handleLongPress,
  handleClick,
  chatroomType,
  navigation,
  openKeyboard,
  onScrollToIndex,
  removeReaction,
  onTapToUndo,
  handleFileUpload,
  index,
  conversations,
  selectedMessages,
  flatlistRef,
}: MessageItem) => {
  const dispatch = useAppDispatch();
  return (
    <View>
      {index < conversations.length &&
      conversations[index]?.date !== conversations[index + 1]?.date ? (
        <View style={[styles.statusMessage]}>
          <Text
            style={{
              color: STYLES.$COLORS.PRIMARY,
              fontSize: STYLES.$FONT_SIZES.SMALL,
              fontFamily: STYLES.$FONT_TYPES.LIGHT,
            }}>
            {item?.date}
          </Text>
        </View>
      ) : null}
      <Pressable
        onLongPress={event => {
          const {pageX, pageY} = event.nativeEvent;
          dispatch({
            type: SET_POSITION,
            body: {pageX: pageX, pageY: pageY},
          });
          handleLongPress(isStateIncluded, isIncluded, item, selectedMessages);
        }}
        delayLongPress={200}
        onPress={function (event) {
          const {pageX, pageY} = event.nativeEvent;
          dispatch({
            type: SET_POSITION,
            body: {pageX: pageX, pageY: pageY},
          });
          handleClick(
            isStateIncluded,
            isIncluded,
            item,
            false,
            selectedMessages,
          );
        }}
        style={isIncluded ? {backgroundColor: '#d7e6f7'} : null}>
        <Messages
          chatroomType={chatroomType}
          onScrollToIndex={(index: any) => {
            flatlistRef.current?.scrollToIndex({animated: true, index});
          }}
          isIncluded={isIncluded}
          item={item}
          navigation={navigation}
          openKeyboard={() => {
            handleClick(
              isStateIncluded,
              isIncluded,
              item,
              true,
              selectedMessages,
            );
          }}
          longPressOpenKeyboard={() => {
            handleLongPress(
              isStateIncluded,
              isIncluded,
              item,
              selectedMessages,
            );
          }}
          removeReaction={(
            item: any,
            reactionArr: any,
            removeFromList?: any,
          ) => {
            removeReaction(item, reactionArr, removeFromList);
          }}
          handleTapToUndo={() => {
            onTapToUndo();
          }}
          handleFileUpload={handleFileUpload}
        />
      </Pressable>
    </View>
  );
};

export default MessageListItem;
