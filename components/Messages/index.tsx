import {View, Text, FlatList} from 'react-native';
import React from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {decode} from '../../commonFuctions';
import ReplyConversations from '../ReplyConversations';
import AttachmentConversations from '../AttachmentConversations';

interface Messages {
  item: any;
}

const Messages = ({item}: Messages) => {
  const isTypeSent = item?.member?.id === 86986 ? true : false;
  return (
    <View style={styles.messageParent}>
      <View>
        {!!item.deleted_by ? (
          <View
            style={[
              styles.message,
              isTypeSent ? styles.sentMessage : styles.receivedMessage,
            ]}>
            <Text style={styles.deletedMsg}>This message has been deleted</Text>
          </View>
        ) : !!item?.reply_conversation_object ? (
          <ReplyConversations item={item} isTypeSent={isTypeSent} />
        ) : item?.attachment_count > 0 ? (
          <AttachmentConversations item={item} isTypeSent={isTypeSent} />
        ) : (
          <View
            style={[
              styles.message,
              isTypeSent ? styles.sentMessage : styles.receivedMessage,
            ]}>
            {!!(item?.member?.id === 86986) ? null : (
              <Text style={styles.messageInfo}>{item?.member?.name}</Text>
            )}
            <Text style={styles.messageText}>{decode(item?.answer, true)}</Text>
            <Text style={styles.messageDate}>{item?.created_at}</Text>
          </View>
        )}

        {isTypeSent ? (
          <View style={styles.typeSent} />
        ) : (
          <View style={styles.typeReceived} />
        )}
      </View>
      {/* {item.reactions.length > 0 && item.reactions.length < 2 ? (
        <View>
          <View>
            <Text
              style={{
                padding: 5,
                borderRadius: 8,
                backgroundColor: 'white',
              }}>{`${item?.reactions[0]?.reaction}`}</Text>
          </View>
        </View>
      ) : (
        item.reactions.length > 1 && (
          <View>
            <View style={{padding: 5, borderRadius: 8}}>
              <Text>{`${item?.reactions[0]?.reaction}`}</Text>
            </View>
            <View style={{padding: 5, borderRadius: 8}}>
              <Text>{`${item?.reactions[0]?.reaction}`}</Text>
            </View>
          </View>
        )
      )} */}
    </View>
  );
};

export default Messages;
