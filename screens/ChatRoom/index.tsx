import {CommonActions} from '@react-navigation/native';
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
import {copySelectedMessages} from '../../commonFuctions';
import InputBox from '../../components/InputBox';
import Messages from '../../components/Messages';
import ToastMessage from '../../components/ToastMessage';
import STYLES from '../../constants/Styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  getChatroom,
  getConversations,
  paginatedConversations,
} from '../../store/actions/chatroom';
import {styles} from './styles';
import Clipboard from '@react-native-clipboard/clipboard';
import {DataSnapshot, onValue, ref} from 'firebase/database';
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
  const db = myClient.fbInstance();
  const [isReply, setIsReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState();
  const [replyChatID, setReplyChatID] = useState<number>();
  const [isLongPress, setIsLongPress] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isToast, setIsToast] = useState(false);
  const [msg, setMsg] = useState('');
  const [apiRes, setApiRes] = useState();
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [shouldLoadMoreChat, setShouldLoadMoreChat] = useState(true);
  const {chatroomID} = route.params;
  const dispatch = useAppDispatch();
  const {conversations = [], chatroomDetails} = useAppSelector(
    state => state.chatroom,
  );

  const {user, community} = useAppSelector(state => state.homefeed);

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
                    setReplyChatID(selectedMessages[0]?.id);
                    setIsReply(true);
                    setReplyMessage(selectedMessages[0]);
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

            <TouchableOpacity
              onPress={() => {
                const output = copySelectedMessages(selectedMessages);
                Clipboard.setString(output);
                setSelectedMessages([]);
                setIsLongPress(false);
                setInitialHeader();
              }}>
              <Image
                source={require('../../assets/images/copy_icon3x.png')}
                style={styles.threeDots}
              />
            </TouchableOpacity>

            {len === 1 &&
              (selectedMessages[0]?.member?.id === user?.id ||
                chatroomDetails?.chatroom?.member?.state === 1) && (
                <TouchableOpacity
                  onPress={async () => {
                    const res = await myClient
                      .deleteMsg({
                        conversation_ids: [selectedMessages[0]?.id],
                        reason: 'none',
                      })
                      .then(async () => {
                        setSelectedMessages([]);
                        setIsLongPress(false);
                        setInitialHeader();
                        let payload = {
                          chatroomID: chatroomID,
                          page: 50,
                        };
                        await dispatch(getConversations(payload, true) as any);
                      })
                      .catch(() => {
                        Alert.alert('Delete message failed');
                      });
                  }}>
                  <Image
                    source={require('../../assets/images/delete_icon3x.png')}
                    style={styles.threeDots}
                  />
                </TouchableOpacity>
              )}
            {len === 1 && (
              <TouchableOpacity
                onPress={() => {
                  setReportModalVisible(true);
                }}>
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

  const handleReportModalClose = () => {
    setReportModalVisible(false);
  };
  async function fetchChatroomDetails() {
    let payload = {chatroom_id: chatroomID};
    let response = await dispatch(getChatroom(payload) as any);
    return response;
  }

  async function fetchData(showLoaderVal?: boolean) {
    await myClient.markReadFn({chatroom_id: chatroomID});
    let payload = {chatroomID: chatroomID, page: 100};
    let response = await dispatch(
      getConversations(
        payload,
        showLoaderVal != undefined && showLoaderVal == false ? false : true,
      ) as any,
    );
    return response;
  }

  async function paginatedData(newPage: number) {
    // let payload = {chatroomID: 69285, page: 1000};
    let payload = {
      chatroomID: chatroomID,
      page: 50,
      conversation_id: conversations[conversations.length - 1]?.id,
      scroll_direction: 0,
    };
    let response = await dispatch(paginatedConversations(payload, true) as any);
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

  useEffect(() => {
    const query = ref(db, `/collabcards/${chatroomID}`);
    return onValue(query, (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        fetchData(false);
      }
    });
  }, []);

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    const res = await paginatedData(newPage);
    if (res.conversations.length == 0) {
      setShouldLoadMoreChat(false);
    }
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

  const leaveChatroom = async () => {
    const payload = {
      collabcard_id: chatroomID,
      member_id: user?.id,
      value: false,
    };
    const res = await myClient
      .leaveChatroom(payload)
      .then(() => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'HomeFeed'}],
          }),
        );
      })
      .catch(() => {
        Alert.alert('Leave Chatroom failed');
      });

    return res;
  };

  const muteNotifications = async () => {
    const payload = {
      chatroom_id: chatroomID,
      value: true,
    };
    myClient
      .muteNotification(payload)
      .then(() => {
        fetchChatroomDetails();
        setMsg('Notifications muted for this chatroom');
        setIsToast(true);
      })
      .catch(() => {
        Alert.alert('Mute Notification failed');
      });
  };

  const unmuteNotifications = async () => {
    const payload = {
      chatroom_id: chatroomID,
      value: false,
    };
    const res = await myClient
      .muteNotification(payload)
      .then(() => {
        fetchChatroomDetails();
        setMsg('Notifications unmuted for this chatroom');
        setIsToast(true);
      })
      .catch(() => {
        Alert.alert('Unmute Notification failed');
      });
  };

  // const getItemLayout = (data: any, index: any) => ({
  //   length: 50,
  //   offset: 50 * index,
  //   index,
  // });

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatlistRef}
        // data={messages}
        data={conversations}
        // initialScrollIndex={
        //   conversations.length > 0 ? conversations.length - 1 : 0
        // }
        // getItemLayout={getItemLayout}
        keyExtractor={item => item?.id.toString()}
        renderItem={({item, index}) => {
          let stateArr = [2, 3]; //joined and left chatroom state
          let isStateIncluded = stateArr.includes(item?.state);
          let isIncluded = selectedMessages.some(
            (val: any) =>
              val?.id === item?.id && !stateArr.includes(val?.state),
          );
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
                onLongPress={() => {
                  setIsLongPress(true);
                  if (isIncluded) {
                    const filterdMessages = selectedMessages.filter(
                      (val: any) =>
                        val?.id !== item?.id && !stateArr.includes(val?.state),
                    );
                    setSelectedMessages([...filterdMessages]);
                  } else {
                    if (!isStateIncluded) {
                      setSelectedMessages([...selectedMessages, item]);
                    }
                  }
                }}
                onPress={() => {
                  if (isLongPress) {
                    if (isIncluded) {
                      const filterdMessages = selectedMessages.filter(
                        (val: any) =>
                          val?.id !== item?.id &&
                          !stateArr.includes(val?.state),
                      );
                      setSelectedMessages([...filterdMessages]);
                    } else {
                      if (!isStateIncluded) {
                        setSelectedMessages([...selectedMessages, item]);
                      }
                    }
                  }
                }}
                style={isIncluded ? {backgroundColor: '#d7e6f7'} : null}>
                <Messages
                  onScrollToIndex={(index: any) => {
                    flatlistRef.current?.scrollToIndex({animated: true, index});
                  }}
                  isIncluded={isIncluded}
                  item={item}
                  navigation={navigation}
                />
              </Pressable>
            </View>
          );
        }}
        onEndReached={() => {
          if (shouldLoadMoreChat) {
            handleLoadMore();
          }
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        inverted
      />

      {chatroomDetails?.chatroom?.member_can_message ? (
        <InputBox
          isReply={isReply}
          replyChatID={replyChatID}
          chatroomID={chatroomID}
          replyMessage={replyMessage}
          setIsReply={(val: any) => {
            setIsReply(val);
          }}
          setReplyMessage={(val: any) => {
            setReplyMessage(val);
          }}
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
              {chatroomDetails?.chatroom_actions?.map(
                (val: any, index: any) => {
                  return (
                    <TouchableOpacity
                      onPress={async () => {
                        // if(val?.id === 2){
                        //   navigation.navigate('ViewParticipants')
                        //   setModalVisible(false)
                        // }
                        if (val?.id === 9) {
                          leaveChatroom();
                          setModalVisible(false);
                        } else if (val?.id === 6) {
                          await muteNotifications();

                          setModalVisible(false);
                        } else if (val?.id === 8) {
                          await unmuteNotifications();
                          setModalVisible(false);
                        }
                      }}
                      key={val + index}
                      style={styles.filtersView}>
                      <Text style={styles.filterText}>{val?.title}</Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal
        // animationType="slide"
        transparent={true}
        visible={reportModalVisible && selectedMessages.length == 1}
        onRequestClose={() => {
          setReportModalVisible(!modalVisible);
        }}>
        <Pressable style={styles.centeredView} onPress={handleReportModalClose}>
          <View>
            <Pressable onPress={() => {}} style={[styles.modalView]}>
              {/* {chatroomDetails?.chatroom_actions?.map(
                (val: any, index: any) => {
                  return (
                    <TouchableOpacity
                      onPress={async () => {
                        // if(val?.id === 2){
                        //   navigation.navigate('ViewParticipants')
                        //   setModalVisible(false)
                        // }
                        if (val?.id === 9) {
                          leaveChatroom();
                          setModalVisible(false);
                        } else if (val?.id === 6) {
                          await muteNotifications();

                          setModalVisible(false);
                        } else if (val?.id === 8) {
                          await unmuteNotifications();
                          setModalVisible(false);
                        }
                      }}
                      key={val + index}
                      style={styles.filtersView}>
                      <Text style={styles.filterText}>{val?.title}</Text>
                    </TouchableOpacity>
                  );
                },
              )} */}
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Report', {
                    convoId: selectedMessages[0].id,
                  });
                  setSelectedMessages([]);
                  setReportModalVisible(false);
                  // handleReportModalClose()
                }}
                style={styles.filtersView}>
                <Text style={styles.filterText}>Report</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <ToastMessage
        message={msg}
        isToast={isToast}
        onDismiss={() => {
          setIsToast(false);
        }}
      />
    </View>
  );
};

export default ChatRoom;
