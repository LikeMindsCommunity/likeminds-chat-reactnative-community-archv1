import {View, Text, Image} from 'react-native';
import React from 'react';
import STYLES from '../../constants/Styles';
import {styles} from './styles';
import {decode} from '../../commonFuctions';

interface ReplyConversations {
  item: any;
  isTypeSent: boolean;
}

interface ReplyBox {
  item: any;
}

export const ReplyBox = ({item}: ReplyBox) => {
  return (
    <View style={styles.replyBox}>
      <View>
        <Text style={styles.replySender}>
          {item?.member?.id === 86986 ? 'You' : item?.member?.name}
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

const ReplyConversations = ({item, isTypeSent}: ReplyConversations) => {
  return (
    <View
      style={[
        styles.replyMessage,
        isTypeSent ? styles.sentMessage : styles.receivedMessage,
      ]}>
      <ReplyBox item={item?.reply_conversation_object} />

      <View style={styles.messageText as any}>
        {decode(item?.answer, true)}
      </View>
      <Text style={styles.messageDate}>{item?.created_at}</Text>
    </View>
  );
};

export default ReplyConversations;
