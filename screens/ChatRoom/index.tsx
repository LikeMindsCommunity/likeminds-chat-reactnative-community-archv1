import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Image,
  Pressable,
} from 'react-native';
import {myClient} from '../..';
import {conversationData} from '../../assets/dummyResponse/conversationData';
import InputBox from '../../components/InputBox';
import Messages from '../../components/Messages';
import STYLES from '../../constants/Styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {getConversations} from '../../store/actions/chatroom';
import {styles} from './styles';

interface Data {
  id: string;
  title: string;
}

interface ChatRoom {
  navigation: any;
  route: any;
}

const ChatRoom = ({navigation, route}: ChatRoom) => {
  const flatlistRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState(
    conversationData?.data?.conversations,
  );
  const [isReply, setIsReply] = useState(false);
  const [replyChatID, setReplyChatID] = useState<number>();
  const [isLongPress, setIsLongPress] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Array<number>>([]);
  const {chatroomID} = route.params;
  const dispatch = useAppDispatch();
  const {conversations = []} = useAppSelector(state => state.chatroom);
  // flatlistRef?.current?.scrollToEnd({animated: false});
  // flatlistRef?.current?.scrollToIndex({
  //   index: conversations.length - 1,
  //   animated: false,
  //   // viewOffset?: number;
  //   // viewPosition?: number;
  // });

  const setInitialHeader = () => {
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
  };
  const setSelectedHeader = () => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity
            onPress={() => {
              setSelectedMessages([]);
              setIsLongPress(false);
              setInitialHeader();
            }}>
            <Image
              source={require('../../assets/images/blue_back_arrow3x.png')}
              style={styles.selectedBackBtn}
            />
          </TouchableOpacity>
          <View style={styles.chatRoomInfo}>
            <Text
              style={{
                color: STYLES.$COLORS.PRIMARY,
                fontSize: STYLES.$FONT_SIZES.LARGE,
                fontFamily: STYLES.$FONT_TYPES.BOLD,
              }}>
              {selectedMessages.length}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => {
        let len = selectedMessages.length;
        return (
          <View style={styles.selectedHeadingContainer}>
            {len === 1 && (
              <TouchableOpacity
                onPress={() => {
                  if(len > 0){
                    setReplyChatID(selectedMessages[0])
                    setIsReply(true);
                    setSelectedMessages([]);
                    setIsLongPress(false);
                    setInitialHeader();
                  }
                  
                }}>
                <Image
                  source={require('../../assets/images/reply_icon3x.png')}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity>
              <Image
                source={require('../../assets/images/copy_icon3x.png')}
                style={styles.threeDots}
              />
            </TouchableOpacity>

            {len === 1 && (
              <TouchableOpacity>
                <Image
                  source={require('../../assets/images/three_dots3x.png')}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            )}
          </View>
        );
      },
    });
  };

  useLayoutEffect(() => {
    setInitialHeader();
  }, [navigation]);

  useEffect(() => {
    async function fetchData() {
      // let payload = {chatroomID: 69285, page: 1000};
      let payload = {chatroomID: chatroomID, page: 1000};
      let response = await dispatch(getConversations(payload) as any);
      console.log('getConversations API -=', response);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMessages.length === 0) {
      setInitialHeader();
    } else if (!!isLongPress) {
      setSelectedHeader();
    }
  }, [isLongPress, selectedMessages]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatlistRef}
        data={conversations}
        // initialScrollIndex={
        //   conversations.length > 0 ? conversations.length - 1 : 60
        // }
        keyExtractor={item => item?.id.toString()}
        renderItem={({item}) => {
          let isIncluded = selectedMessages.includes(item?.id);
          return (
            <Pressable
              onLongPress={() => {
                setIsLongPress(true);
                if (isIncluded) {
                  const filterdMessages = selectedMessages.filter(
                    val => val !== item?.id,
                  );
                  setSelectedMessages([...filterdMessages]);
                } else {
                  setSelectedMessages([...selectedMessages, item?.id]);
                }
              }}
              onPress={() => {
                if (isLongPress) {
                  if (isIncluded) {
                    const filterdMessages = selectedMessages.filter(
                      val => val !== item?.id,
                    );
                    setSelectedMessages([...filterdMessages]);
                  } else {
                    setSelectedMessages([...selectedMessages, item?.id]);
                  }
                }
              }}
              style={isIncluded ? {backgroundColor: '#d7e6f7'} : null}>
              <Messages isIncluded={isIncluded} item={item} />
            </Pressable>
          );
        }}
        inverted
      />

      <InputBox isReply={isReply} replyChatID={replyChatID} />
    </View>
  );
};

export default ChatRoom;
