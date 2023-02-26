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
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import {myClient} from '../..';
import {conversationData} from '../../assets/dummyResponse/conversationData';
import InputBox from '../../components/InputBox';
import Messages from '../../components/Messages';
import STYLES from '../../constants/Styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {getChatroom, getConversations} from '../../store/actions/chatroom';
import {styles} from './styles';
// import database from '@react-native-firebase/database';

// let itemsRef = database().ref('/items');

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
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const {chatroomID} = route.params;
  const dispatch = useAppDispatch();
  const {conversations = [], chatroomDetails} = useAppSelector(
    state => state.chatroom,
  );

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
              {chatroomDetails?.chatroom?.header}
            </Text>
            <Text
              style={{
                color: STYLES.$COLORS.MSG,
                fontSize: STYLES.$FONT_SIZES.SMALL,
                fontFamily: STYLES.$FONT_TYPES.LIGHT,
              }}>
              {`${chatroomDetails?.chatroom?.participants_count} participants`}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setModalVisible(!modalVisible);
          }}>
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
                  if (len > 0) {
                    setReplyChatID(selectedMessages[0]);
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

  async function fetchChatroomDetails() {
    let payload = {chatroom_id: chatroomID};
    let response = await dispatch(getChatroom(payload) as any);
    console.log('getChatroom ==', response);
    return response;
  }

  async function fetchData() {
    // let payload = {chatroomID: 69285, page: 1000};
    // await myClient.markReadFn({chatroom_id: chatroomID});
    let payload = {chatroomID: chatroomID, page: 100 * page};
    let response = await dispatch(getConversations(payload, true) as any);
    console.log('getConversations ==', response);
    return response;
  }

  async function paginatedData(newPage: number) {
    // let payload = {chatroomID: 69285, page: 1000};
    let payload = {chatroomID: chatroomID, page: 100 * newPage};
    let response = await dispatch(getConversations(payload, false) as any);
    return response;
  }

  useLayoutEffect(() => {
    fetchChatroomDetails();
    setInitialHeader();
  }, [navigation]);

  useEffect(() => {
    setInitialHeader();
  }, [chatroomDetails]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMessages.length === 0) {
      setInitialHeader();
    } else if (!!isLongPress) {
      setSelectedHeader();
    }
  }, [isLongPress, selectedMessages]);

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    const res = await paginatedData(newPage);
    if (!!res) {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && conversations.length > 0) {
      if (conversations.length > 15) {
        const newPage = page + 1;
        setPage(newPage);
        loadData(newPage);
      }
    }
    // if (!isLoading && conversations.length > 0) {
    //   const newPage = page + 1
    //     setPage(newPage);
    //     loadData(newPage);
    // }
  };

  const renderFooter = () => {
    return isLoading ? (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
      </View>
    ) : null;
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatlistRef}
        // data={messages}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        inverted
      />

      {chatroomDetails?.chatroom?.member_can_message ? (
        <InputBox
          isReply={isReply}
          replyChatID={replyChatID}
          chatroomID={chatroomID}
        />
      ) : (
        <View style={styles.disabledInput}>
          <Text style={styles.disabledInputText}>Responding is disabled</Text>
        </View>
      )}

      <Modal
        // animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <Pressable style={styles.centeredView} onPress={handleModalClose}>
          <View>
            <Pressable onPress={() => {}} style={[styles.modalView]}>
              {chatroomDetails?.chatroom_actions?.map((val: any, index: any) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      // setFilterState(index);
                    }}
                    key={val + index}
                    style={styles.filtersView}>
                    <Text style={styles.filterText}>{val?.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ChatRoom;
