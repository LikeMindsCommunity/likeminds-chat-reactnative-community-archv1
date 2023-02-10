import React, {useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Image,
} from 'react-native';
import { conversationData } from '../../assets/dummyResponse/conversationData';
import InputBox from '../../components/InputBox';
import Messages from '../../components/Messages';
import STYLES from '../../constants/Styles';
import {styles} from './styles';

// interface Message {
//     id: number;
//     type: 'sent' | 'received';
//     value: string;
//     date: string;
// }

interface ChatRoom {
  navigation: any;
}

const ChatRoom = ({navigation}: ChatRoom) => {
  const [messages, setMessages] = useState(conversationData?.data?.conversations);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity onPress={navigation.goBack}>
            <Image
              source={require('../../assets/images/back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          <View style={styles.chatRoomInfo}>
            <Text
              style={{
                color: STYLES.$COLORS.PRIMARY,
                fontSize: STYLES.$FONT_SIZES.LARGE,
                fontFamily: STYLES.$FONT_TYPES.BOLD,
              }}>
              Scalix Chat
            </Text>
            <Text
              style={{
                color: STYLES.$COLORS.MSG,
                fontSize: STYLES.$FONT_SIZES.SMALL,
                fontFamily: STYLES.$FONT_TYPES.LIGHT,
              }}>
              25 participantss
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity>
          <Image
            source={require('../../assets/images/three_dots3x.png')}
            style={styles.threeDots}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //   const onSend = () => {
  //     if (message.trim().length > 0) {
  //       setMessages([
  //         ...messages,
  //         {
  //           id: messages.length + 1,
  //           type: 'sent',
  //           value: message,
  //           date: new Date().toLocaleString(),
  //         },
  //       ]);
  //       setMessage('');
  //       Keyboard.dismiss();
  //     }
  //   };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={item => item?.id.toString()}
        renderItem={({item}) => (
          <Messages item={item} />
        )}
      />

      <InputBox />
    </View>
  );
};

export default ChatRoom;
