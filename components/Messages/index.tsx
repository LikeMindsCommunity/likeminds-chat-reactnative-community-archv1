import {View, Text, Image, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {decode} from '../../commonFuctions';
import ReplyConversations from '../ReplyConversations';
import AttachmentConversations from '../AttachmentConversations';
import ReactionGridModal from '../ReactionGridModal';
import {useAppSelector} from '../../store';

interface Messages {
  item: any;
  isIncluded: boolean;
}

const Messages = ({item, isIncluded}: Messages) => {
  const {user} = useAppSelector(state => state.homefeed);
  const [modalVisible, setModalVisible] = useState(false);
  const isTypeSent = item?.member?.id === user?.id ? true : false;
  const stateArr = [2, 3, 7, 8, 9]; //states for person left, joined, added, removed messages.
  const isItemIncludedInStateArr = stateArr.includes(item?.state);

  let reactionArr: any = [];
  let defaultReactionArrLen = item?.reactions?.length;
  for (let i = 0; i < defaultReactionArrLen; i++) {
    if (defaultReactionArrLen > 0) {
      let isIncuded = reactionArr.some(
        (val: any) => val['reaction'] === item?.reactions[i]?.reaction,
      );
      if (isIncuded) {
        let index = reactionArr.findIndex(
          (val: any) => val['reaction'] === item?.reactions[i]?.reaction,
        );
        reactionArr[index].memberArr = [
          ...reactionArr[index]?.memberArr,
          item?.reactions[i]?.member,
        ];
      } else {
        let obj = {
          reaction: item?.reactions[i]?.reaction,
          memberArr: [item?.reactions[i]?.member],
        };
        reactionArr = [...reactionArr, obj];
      }
    }
  }

  const reactionLen = reactionArr.length;
  // const reactionLen = 8;
  return (
    <View style={styles.messageParent}>
      <View>
        {!!item?.deleted_by ? (
          <View
            style={[
              styles.message,
              isTypeSent ? styles.sentMessage : styles.receivedMessage,
              isIncluded ? {backgroundColor: '#e8f1fa'} : null,
            ]}>
            <Text style={styles.deletedMsg}>This message has been deleted</Text>
          </View>
        ) : !!item?.reply_conversation_object ? (
          <ReplyConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
          />
        ) : item?.attachment_count > 0 ? (
          <AttachmentConversations
            isIncluded={isIncluded}
            item={item}
            isTypeSent={isTypeSent}
          />
        ) : (
          <View>
            {isItemIncludedInStateArr ? (
              <View style={[styles.statusMessage]}>
                <Text>{decode(item?.answer, true)}</Text>
              </View>
            ) : (
              <View
                style={[
                  styles.message,
                  isTypeSent ? styles.sentMessage : styles.receivedMessage,
                  isIncluded ? {backgroundColor: '#e8f1fa'} : null,
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
                    ? {borderBottomColor: '#e8f1fa', borderLeftColor: '#e8f1fa'}
                    : null,
                ]}
              />
            ) : (
              <View
                style={[
                  styles.typeReceived,
                  isIncluded
                    ? {
                        borderBottomColor: '#e8f1fa',
                        borderRightColor: '#e8f1fa',
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
            style={
              isTypeSent
                ? styles.reactionSentParent
                : styles.reactionReceivedParent
            }>
            {reactionArr.map((val: any, index: any) => (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                }}
                style={styles.reaction}
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
              onPress={() => {
                setModalVisible(true);
              }}
              style={styles.reaction}>
              <Text>{reactionArr[0]?.reaction}</Text>
              <Text style={styles.messageText}>
                {reactionArr[0]?.memberArr?.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
              }}
              style={styles.reaction}>
              <Text>{reactionArr[1]?.reaction}</Text>
              <Text style={styles.messageText}>
                {reactionArr[1]?.memberArr?.length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreReaction}>
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
        setModalVisible={val => {
          setModalVisible(val);
        }}
      />
    </View>
  );
};

export default Messages;
