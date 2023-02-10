import {View, Text, FlatList} from 'react-native';
import React from 'react';
import InputBox from '../InputBox';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import { decode } from '../../commonFuctions';

interface Messages {
  item: any;
}

const Messages = ({item}: Messages) => {
const isTypeSent = false;
  return (
    <View style={styles.messageParent}>
      <View
        style={[
          styles.message,
          isTypeSent ? styles.sentMessage : styles.receivedMessage,
        ]}>
        <Text style={styles.messageText}>{decode(item?.answer, true)}</Text>
        <Text style={styles.messageDate}>{item?.created_at}</Text>
      </View>
      {isTypeSent ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: -15,
            borderBottomWidth: 10,
            borderRightWidth: 10,
            borderLeftWidth: 10,
            borderTopWidth: 10,
            // borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            borderBottomColor: STYLES.$COLORS.TERTIARY,
            borderLeftColor: STYLES.$COLORS.TERTIARY,
            borderColor: 'transparent',
          }}
        />
      ) : (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: -15,
            borderBottomWidth: 10,
            borderRightWidth: 10,
            borderLeftWidth: 10,
            borderTopWidth: 10,
            borderBottomLeftRadius: 8,
            // borderBottomRightRadius: 8,
            borderBottomColor: STYLES.$COLORS.TERTIARY,
            borderRightColor: STYLES.$COLORS.TERTIARY,
            borderColor: 'transparent',
          }}
        />
      )}
    </View>
  );
};

export default Messages;
