import {View, Text, Image} from 'react-native';
import React from 'react';
import STYLES from '../../constants/Styles';
import {styles} from './styles';
import {decode} from '../../commonFuctions';

interface ReplyConversations {
  item: any;
  isTypeSent: boolean;
}

const ReplyConversations = ({item, isTypeSent}: ReplyConversations) => {
  return (
    <View
      style={[
        styles.replyMessage,
        isTypeSent ? styles.sentMessage : styles.receivedMessage,
      ]}>
      <View style={styles.replyBox}>
        <View>
          <Text style={styles.replySender}>
            {item.reply_conversation_object?.member?.id === 86986
              ? 'You'
              : item?.reply_conversation_object?.member?.name}
          </Text>
        </View>
        <View
          style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          {!!item?.reply_conversation_object.has_files ? (
            item?.reply_conversation_object.attachments[0].type === 'image' ? (
              <Image
                source={require('../../assets/images/image_icon3x.png')}
                style={styles.icon}
              />
            ) : item?.reply_conversation_object.attachments[0].type ===
              'pdf' ? (
              <Image
                source={require('../../assets/images/document_icon3x.png')}
                style={styles.icon}
              />
            ) : null
          ) : null}
          <Text style={styles.messageText}>
            {decode(
              !!item?.reply_conversation_object?.answer
                ? item?.reply_conversation_object?.answer
                : item?.reply_conversation_object?.attachments[0]?.type ===
                  'pdf'
                ? `Document`
                : item?.reply_conversation_object?.attachments[0].type ===
                  'image'
                ? `Photo`
                : null,
              true,
            )}
          </Text>
          {!!item?.reply_conversation_object.has_files && item?.reply_conversation_object.attachments.length > 1 ? (
            <View>
              <Text style={styles.messageText}>{` (+${
                item?.reply_conversation_object.attachments.length - 1
              } more)`}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.messageText as any}>
        {decode(item?.answer, true)}
      </View>
      <Text style={styles.messageDate}>{item?.created_at}</Text>
    </View>
  );
};

export default ReplyConversations;
