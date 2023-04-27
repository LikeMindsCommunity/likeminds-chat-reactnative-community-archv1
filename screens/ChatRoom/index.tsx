import {CommonActions, useIsFocused} from '@react-navigation/native';
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
  BackHandler,
  ScrollView,
  Platform,
} from 'react-native';
import {myClient} from '../..';
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
import {getDMFeedData, getHomeFeedData} from '../../store/actions/homefeed';
import {
  ACCEPT_INVITE_SUCCESS,
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  LONG_PRESSED,
  REACTION_SENT,
  REJECT_INVITE_SUCCESS,
  SELECTED_MESSAGES,
  SET_EXPLORE_FEED_PAGE,
  SET_PAGE,
  SET_POSITION,
  SHOW_TOAST,
  UPDATE_CHAT_REQUEST_STATE,
} from '../../store/types/types';
import {
  START_CHATROOM_LOADING,
  STOP_CHATROOM_LOADING,
} from '../../store/types/loader';
import {getExploreFeedData} from '../../store/actions/explorefeed';
import Layout from '../../constants/Layout';
import EmojiPicker, {EmojiKeyboard} from 'rn-emoji-keyboard';

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

  const db = myClient.fbInstance();

  const [isReply, setIsReply] = useState(false);
  const [replyMessage, setReplyMessage] = useState();
  const [replyChatID, setReplyChatID] = useState<number>();
  // const [isLongPress, setIsLongPress] = useState(false);
  // const [selectedMessages, setSelectedMessages] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isToast, setIsToast] = useState(false);
  const [msg, setMsg] = useState('');
  const [apiRes, setApiRes] = useState();
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [shouldLoadMoreChat, setShouldLoadMoreChat] = useState(true);
  const [isReact, setIsReact] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showDM, setShowDM] = useState<any>(null);
  const reactionArr = ['❤️', '😂', '😮', '😢', '😠', '👍'];

  const {chatroomID, isInvited} = route.params;
  const isFocused = useIsFocused();

  const dispatch = useAppDispatch();
  const {
    conversations = [],
    chatroomDetails,
    messageSent,
    isLongPress,
    selectedMessages,
    stateArr,
    position,
  } = useAppSelector(state => state.chatroom);

  let routes = navigation.getState()?.routes;
  let prevRoute = routes[routes.length - 2];

  const {user, community} = useAppSelector(state => state.homefeed);
  let isSecret = chatroomDetails?.chatroom?.is_secret;

  let notIncludedActionsID = [3];
  let filteredChatroomActions = chatroomDetails?.chatroom_actions?.filter(
    (val: any) => !notIncludedActionsID?.includes(val?.id),
  );
  const setInitialHeader = () => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity
            onPress={() => {
              dispatch({
                type: CLEAR_CHATROOM_CONVERSATION,
                body: {conversations: []},
              });
              dispatch({
                type: CLEAR_CHATROOM_DETAILS,
                body: {chatroomDetails: {}},
              });
              navigation.goBack();
            }}>
            <Image
              source={require('../../assets/images/back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          {!(Object.keys(chatroomDetails).length === 0) ? (
            <View style={styles.chatRoomInfo}>
              <Text
                style={{
                  color: STYLES.$COLORS.PRIMARY,
                  fontSize: STYLES.$FONT_SIZES.LARGE,
                  fontFamily: STYLES.$FONT_TYPES.BOLD,
                }}>
                {chatroomDetails?.chatroom?.type === 10
                  ? user?.id !==
                    chatroomDetails?.chatroom?.chatroom_with_user?.id
                    ? chatroomDetails?.chatroom?.chatroom_with_user?.name
                    : chatroomDetails?.chatroom?.member?.name!
                  : chatroomDetails?.chatroom?.header}
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
          ) : null}
        </View>
      ),
      headerRight: () =>
        filteredChatroomActions?.length > 0 && (
          <View>
            {!!chatroomDetails ? (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}>
                <Image
                  source={require('../../assets/images/three_dots3x.png')}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            ) : null}
          </View>
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
              dispatch({type: SELECTED_MESSAGES, body: []});
              dispatch({type: LONG_PRESSED, body: false});
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
        let communityManagerState = 1;
        let userCanDeleteParticularMessageArr: any = [];
        let selectedMessagesIDArr: any = [];
        let isCopy = false;
        let isDelete = false;
        for (let i = 0; i < selectedMessages.length; i++) {
          if (!!!selectedMessages[i]?.deleted_by && !isCopy) {
            isCopy = true;
          }

          if (
            selectedMessages[i]?.member?.id === user?.id &&
            !!!selectedMessages[i]?.deleted_by
          ) {
            userCanDeleteParticularMessageArr = [
              ...userCanDeleteParticularMessageArr,
              true,
            ];
            selectedMessagesIDArr = [
              ...selectedMessagesIDArr,
              selectedMessages[i]?.id,
            ];
          } else {
            userCanDeleteParticularMessageArr = [
              ...userCanDeleteParticularMessageArr,
              false,
            ];
            selectedMessagesIDArr = [
              ...selectedMessagesIDArr,
              selectedMessages[i]?.id,
            ];
          }
        }

        if (userCanDeleteParticularMessageArr.includes(false)) {
          if (
            user?.state === communityManagerState &&
            userCanDeleteParticularMessageArr.length === 1 &&
            !!!selectedMessages[0]?.deleted_by
          ) {
            isDelete = true;
          } else {
            isDelete = false;
          }
        } else {
          isDelete = true;
        }
        return (
          <View style={styles.selectedHeadingContainer}>
            {len === 1 &&
              !!!selectedMessages[0].deleted_by &&
              chatroomDetails?.chatroom?.member_can_message &&
              chatroomDetails?.chatroom?.follow_status && (
                <TouchableOpacity
                  onPress={() => {
                    if (len > 0) {
                      setReplyChatID(selectedMessages[0]?.id);
                      setIsReply(true);
                      setReplyMessage(selectedMessages[0]);
                      dispatch({type: SELECTED_MESSAGES, body: []});
                      dispatch({type: LONG_PRESSED, body: false});
                      setInitialHeader();
                    }
                  }}>
                  <Image
                    source={require('../../assets/images/reply_icon3x.png')}
                    style={styles.threeDots}
                  />
                </TouchableOpacity>
              )}

            {len === 1 && !!!selectedMessages[0].deleted_by ? (
              <TouchableOpacity
                onPress={() => {
                  const output = copySelectedMessages(selectedMessages);
                  Clipboard.setString(output);
                  dispatch({type: SELECTED_MESSAGES, body: []});
                  dispatch({type: LONG_PRESSED, body: false});
                  setInitialHeader();
                }}>
                <Image
                  source={require('../../assets/images/copy_icon3x.png')}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            ) : len > 1 && isCopy ? (
              <TouchableOpacity
                onPress={() => {
                  const output = copySelectedMessages(selectedMessages);
                  Clipboard.setString(output);
                  dispatch({type: SELECTED_MESSAGES, body: []});
                  dispatch({type: LONG_PRESSED, body: false});
                  setInitialHeader();
                }}>
                <Image
                  source={require('../../assets/images/copy_icon3x.png')}
                  style={styles.threeDots}
                />
              </TouchableOpacity>
            ) : null}
            {isDelete && (
              <TouchableOpacity
                onPress={async () => {
                  const res = await myClient
                    .deleteMsg({
                      conversation_ids: selectedMessagesIDArr,
                      reason: 'none',
                    })
                    .then(async () => {
                      dispatch({type: SELECTED_MESSAGES, body: []});
                      dispatch({type: LONG_PRESSED, body: false});
                      setInitialHeader();
                      let payload = {
                        chatroomID: chatroomID,
                        page: conversations.length * 2,
                      };
                      await dispatch(getConversations(payload, false) as any);
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
            {len === 1 && !!!selectedMessages[0].deleted_by && (
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

  async function fetchData(showLoaderVal?: boolean) {
    let payload = {chatroomID: chatroomID, page: 100};
    let response = await dispatch(
      getConversations(
        payload,
        showLoaderVal != undefined && showLoaderVal == false ? false : true,
      ) as any,
    );
    if (!isInvited) {
      const response = await myClient.markReadFn({chatroom_id: chatroomID});

      const res = await myClient.crSeenFn({
        collabcard_id: chatroomID,
        // community_id: community?.id,
        member_id: user?.id,
        collabcard_type: chatroomDetails?.chatroom?.type,
      });
      dispatch({type: SET_PAGE, body: 1});
      if (chatroomDetails?.chatroom.type === 10) {
        dispatch(
          getDMFeedData({community_id: community?.id, page: 1}, false) as any,
        );
      } else {
        await dispatch(getHomeFeedData({page: 1}, false) as any);
      }
    }
    return response;
  }

  async function fetchChatroomDetails() {
    let payload = {chatroom_id: chatroomID};
    let response = await dispatch(getChatroom(payload) as any);
    console.log('fetchChatroomDetails ==', response);
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
    // dispatch({type: START_CHATROOM_LOADING});
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    dispatch({
      type: CLEAR_CHATROOM_CONVERSATION,
      body: {conversations: []},
    });
    dispatch({
      type: CLEAR_CHATROOM_DETAILS,
      body: {chatroomDetails: {}},
    });
    fetchChatroomDetails();
    setInitialHeader();
  }, [navigation]);

  // useEffect(() => {
  //   const backAction = () => {
  //     dispatch({ type: SELECTED_MESSAGES, body: [] });
  //     dispatch({ type: LONG_PRESSED, body: false });
  //     dispatch({
  //       type: CLEAR_CHATROOM_CONVERSATION,
  //       body: { conversations: [] },
  //     });
  //     dispatch({
  //       type: CLEAR_CHATROOM_DETAILS,
  //       body: { chatroomDetails: {} },
  //     });
  //     setInitialHeader();
  //     return null;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,
  //   );

  //   return () => backHandler.remove();
  // }, []);

  useEffect(() => {
    setInitialHeader();
  }, [chatroomDetails]);

  useEffect(() => {
    async function callApi() {
      if (
        chatroomDetails?.chatroom.type == 10 &&
        chatroomDetails?.chatroom.is_private_member == true
      ) {
        let response = await myClient.canDmFeed({
          req_from: 'chatroom',
          chatroom_id: chatroomDetails?.chatroom?.id,
          community_id: community?.id,
          member_id: chatroomDetails?.chatroom?.chatroom_with_user?.id,
        });
        if (!!response?.cta) {
          setShowDM(response?.show_dm);
        }
        console.log(' dmStatus in chatroom =', response);
      }
      let res = await fetchData(false);
      if (!!res) {
        // dispatch({type: STOP_CHATROOM_LOADING});
      }
    }

    if (!!chatroomDetails?.chatroom) {
      callApi();
    }
  }, [chatroomDetails]);

  useEffect(() => {
    if (conversations.length > 0) {
      flatlistRef?.current?.scrollToIndex({
        animated: false,
        index: 0,
      });
    }
  }, [messageSent]);

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

  useEffect(() => {
    if (isFocused) {
      routes = navigation.getState()?.routes;
      prevRoute = routes[routes.length - 2];
    }
  }, [isFocused]);

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

  const handleReactionModalClose = () => {
    setIsReact(false);
  };

  const leaveChatroom = async () => {
    const payload = {
      collabcard_id: chatroomID,
      member_id: user?.id,
      value: false,
    };
    const res = await myClient
      .leaveChatroom(payload)
      .then(async () => {
        if (prevRoute?.name === 'ExploreFeed') {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            community_id: community?.id,
            order_type: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          dispatch({type: SET_PAGE, body: 1});
          await dispatch(getHomeFeedData({page: 1}) as any);
          dispatch({
            type: CLEAR_CHATROOM_CONVERSATION,
            body: {conversations: []},
          });
          dispatch({
            type: CLEAR_CHATROOM_DETAILS,
            body: {chatroomDetails: {}},
          });
          navigation.goBack();
        } else {
          dispatch({type: SET_PAGE, body: 1});
          await dispatch(getHomeFeedData({page: 1}) as any);
          dispatch({
            type: CLEAR_CHATROOM_CONVERSATION,
            body: {conversations: []},
          });
          dispatch({
            type: CLEAR_CHATROOM_DETAILS,
            body: {chatroomDetails: {}},
          });
          navigation.goBack();
        }
      })
      .catch(() => {
        Alert.alert('Leave Chatroom failed');
      });

    return res;
  };

  const leaveSecretChatroom = async () => {
    const payload = {
      chatroom_id: chatroomID,
      member_id: user?.id,
    };
    const res = await myClient
      .leaveSecretChatroom(payload)
      .then(async () => {
        if (prevRoute?.name === 'ExploreFeed') {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            community_id: community?.id,
            order_type: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          dispatch({type: SET_PAGE, body: 1});
          await dispatch(getHomeFeedData({page: 1}) as any);
          dispatch({
            type: CLEAR_CHATROOM_CONVERSATION,
            body: {conversations: []},
          });
          dispatch({
            type: CLEAR_CHATROOM_DETAILS,
            body: {chatroomDetails: {}},
          });
          navigation.goBack();
        } else {
          dispatch({type: SET_PAGE, body: 1});
          await dispatch(getHomeFeedData({page: 1}) as any);
          dispatch({
            type: CLEAR_CHATROOM_CONVERSATION,
            body: {conversations: []},
          });
          dispatch({
            type: CLEAR_CHATROOM_DETAILS,
            body: {chatroomDetails: {}},
          });
          navigation.goBack();
        }
      })
      .catch(() => {
        Alert.alert('Leave Chatroom failed');
      });
    return res;
  };

  const joinChatroom = async () => {
    const payload = {
      collabcard_id: chatroomID,
      member_id: user?.id,
      value: true,
    };
    const res = await myClient
      .leaveChatroom(payload)
      .then(async () => {
        if (prevRoute?.name === 'ExploreFeed') {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            community_id: community?.id,
            order_type: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          dispatch({type: SET_PAGE, body: 1});
          await dispatch(getHomeFeedData({page: 1}) as any);
        } else {
          dispatch({type: SET_PAGE, body: 1});
          await dispatch(getHomeFeedData({page: 1}) as any);
        }
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes:
              prevRoute?.name === 'ExploreFeed'
                ? [{name: 'HomeFeed'}, {name: prevRoute?.name}]
                : [{name: prevRoute?.name}],
          }),
        );
      })
      .catch(() => {
        Alert.alert('Join Chatroom failed');
      });

    return res;
  };

  const joinSecretChatroom = async () => {
    const payload = {
      collabcard_id: chatroomID,
      member_id: user?.id,
      value: true,
    };
    const res = await myClient
      .leaveChatroom(payload)
      .then(async () => {
        let payload = {chatroom_id: chatroomID};
        await dispatch(getChatroom(payload) as any);

        let payload1 = {chatroomID: chatroomID, page: 100};
        await dispatch(getConversations(payload1, true) as any);

        if (prevRoute?.name === 'ExploreFeed') {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            community_id: community?.id,
            order_type: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          dispatch({type: SET_PAGE, body: 1});
          await dispatch(getHomeFeedData({page: 1}) as any);
        } else {
          dispatch({type: SET_PAGE, body: 1});
          await dispatch(getHomeFeedData({page: 1}) as any);
        }
      })
      .catch(() => {
        Alert.alert('Join Secret Chatroom failed');
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
      .then(res => {
        console.log('muteNotifications', res);
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

  const showJoinAlert = () =>
    Alert.alert(
      'Join this chatroom?',
      'You are about to join this secret chatroom.',
      [
        {
          text: 'Cancel',
          // onPress: () => Alert.alert('Cancel Pressed'),
          style: 'default',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            let res = await myClient.inviteAction({
              channel_id: `${chatroomID}`,
              invite_status: 1,
            });
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Invitation accepted'},
            });

            dispatch({type: ACCEPT_INVITE_SUCCESS, body: chatroomID});
            dispatch({type: SET_PAGE, body: 1});
            await dispatch(getChatroom({chatroom_id: chatroomID}) as any);
            await dispatch(getHomeFeedData({page: 1}, false) as any);
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
        // cancelable: true,
        // onDismiss: () =>
        //   Alert.alert(
        //     'This alert was dismissed by tapping outside of the alert dialog.',
        //   ),
      },
    );

  const showRejectAlert = () =>
    Alert.alert(
      'Reject Invitation?',
      'Are you sure you want to reject the invitation to join this chatroom?',
      [
        {
          text: 'Cancel',
          // onPress: () => Alert.alert('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            let res = await myClient.inviteAction({
              channel_id: `${chatroomID}`,
              invite_status: 2,
            });
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Invitation rejected'},
            });

            dispatch({
              type: CLEAR_CHATROOM_CONVERSATION,
              body: {conversations: []},
            });
            dispatch({
              type: CLEAR_CHATROOM_DETAILS,
              body: {chatroomDetails: {}},
            });
            dispatch({type: REJECT_INVITE_SUCCESS, body: chatroomID});
            navigation.goBack();
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
        // cancelable: true,
        // onDismiss: () =>
        //   Alert.alert(
        //     'This alert was dismissed by tapping outside of the alert dialog.',
        //   ),
      },
    );

  const sendReactionAPI = async (consversationID: any, reaction: any) => {
    const res = await myClient.addAction({
      chatroom_id: chatroomID,
      conversation_id: consversationID,
      reaction: reaction,
    });
  };

  const removeReactionAPI = async (consversationID: any, reaction: any) => {
    const res = await myClient.removeAction({
      chatroom_id: chatroomID,
      conversation_id: consversationID,
      reaction: reaction,
    });
  };

  const sendReaction = (val: any) => {
    let previousMsg = selectedMessages[0];
    let changedMsg;
    if (selectedMessages[0]?.reactions.length > 0) {
      let isReactedArr = selectedMessages[0]?.reactions.filter(
        (val: any) => val?.member?.id === user?.id,
      );
      if (isReactedArr.length > 0) {
        // Reacted different emoji
        if (isReactedArr[0].reaction !== val) {
          const resultArr = selectedMessages[0]?.reactions.map((element: any) =>
            element?.member?.id === user?.id
              ? {
                  member: {
                    id: user?.id,
                    name: user?.name,
                    image_url: '',
                  },
                  reaction: val,
                  updated_at: Date.now(),
                }
              : element,
          );
          changedMsg = {
            ...selectedMessages[0],
            reactions: resultArr,
          };
          //API call
        } else if (isReactedArr[0].reaction === val) {
          // Reacted same emoji
          const resultArr = selectedMessages[0]?.reactions.map((element: any) =>
            element?.member?.id === user?.id
              ? {
                  member: {
                    id: user?.id,
                    name: user?.name,
                    image_url: '',
                  },
                  reaction: val,
                  updated_at: Date.now(),
                }
              : element,
          );
          changedMsg = {
            ...selectedMessages[0],
            reactions: resultArr,
          };
          // No API call
        }
      } else {
        changedMsg = {
          ...selectedMessages[0],
          reactions: [
            ...selectedMessages[0]?.reactions,
            {
              member: {
                id: user?.id,
                name: user?.name,
                image_url: '',
              },
              reaction: val,
              updated_at: Date.now(),
            },
          ],
        };
        //API call
      }
    } else {
      changedMsg = {
        ...selectedMessages[0],
        reactions: [
          ...selectedMessages[0]?.reactions,
          {
            member: {
              id: user?.id,
              name: user?.name,
              image_url: '',
            },
            reaction: val,
            updated_at: Date.now(),
          },
        ],
      };
    }

    dispatch({
      type: REACTION_SENT,
      body: {
        previousMsg: previousMsg,
        changedMsg: changedMsg,
      },
    });
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    setIsReact(false);
    sendReactionAPI(previousMsg?.id, val);
  };

  const removeReaction = (item: any) => {
    let previousMsg = item;
    let changedMsg;
    let val;
    if (item?.reactions.length > 0) {
      let index = item?.reactions.findIndex(
        (val: any) => val?.member?.id === user?.id,
      );
      let tempArr = [...item?.reactions];

      val = tempArr[index];

      if (index !== undefined || index !== -1) {
        tempArr.splice(index, 1);
      }

      changedMsg = {
        ...item,
        reactions: tempArr,
      };

      dispatch({
        type: REACTION_SENT,
        body: {
          previousMsg: previousMsg,
          changedMsg: changedMsg,
        },
      });
    }
    removeReactionAPI(previousMsg?.id, val?.reaction);
  };

  const handlePick = (emojiObject: any) => {
    sendReaction(emojiObject?.emoji);
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    setIsOpen(false);
  };

  const handleLongPress = (
    isStateIncluded: any,
    isIncluded: any,
    item: any,
  ) => {
    dispatch({type: LONG_PRESSED, body: true});

    if (isIncluded) {
      const filterdMessages = selectedMessages.filter(
        (val: any) => val?.id !== item?.id && !isStateIncluded,
      );
      dispatch({
        type: SELECTED_MESSAGES,
        body: [...filterdMessages],
      });
    } else {
      if (!isStateIncluded) {
        dispatch({
          type: SELECTED_MESSAGES,
          body: [...selectedMessages, item],
        });
      }
    }

    if (!isLongPress) {
      setIsReact(true);
    }
  };

  const handleClick = (
    isStateIncluded: any,
    isIncluded: any,
    item: any,
    emojiClicked: any,
  ) => {
    if (isLongPress) {
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !isStateIncluded,
        );
        if (filterdMessages.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({type: LONG_PRESSED, body: false});
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
      }
    } else if (emojiClicked) {
      dispatch({type: LONG_PRESSED, body: true});
      if (isIncluded) {
        const filterdMessages = selectedMessages.filter(
          (val: any) => val?.id !== item?.id && !stateArr.includes(val?.state),
        );
        if (filterdMessages.length > 0) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
        } else {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...filterdMessages],
          });
          dispatch({type: LONG_PRESSED, body: false});
        }
      } else {
        if (!isStateIncluded) {
          dispatch({
            type: SELECTED_MESSAGES,
            body: [...selectedMessages, item],
          });
        }
        setIsReact(true);
      }
    }
  };

  const getItemLayout = (data: any, index: any) => ({
    length: 85,
    offset: 85 * index,
    index,
  });

  // this function calls API to approve DM request
  const onApprove = async () => {
    let response = await myClient.requestDmAction({
      chatroom_id: chatroomID,
      chat_request_state: 1,
    });
    console.log('requestDmAction approve =', response, {
      chatroom_id: chatroomID,
      chat_request_state: 1,
    });
    fetchData();

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: {chatRequestState: 1},
    });
  };

  // this function calls API to reject DM request
  const onReject = async () => {
    let response = await myClient.requestDmAction({
      chatroom_id: chatroomID,
      chat_request_state: 2,
    });

    console.log('requestDmAction reject =', response);

    fetchData();

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: {chatRequestState: 2},
    });
  };

  // this function calls API to approve DM request on click TapToUndo
  const onTapToUndo = async () => {
    let response = await myClient.blockCR({
      chatroom_id: chatroomID,
      status: 1,
    });

    console.log('onTapToUndo reject =', response);
    fetchData();

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: {chatRequestState: 1},
    });
  };

  // this function calls API to block a member
  const blockMember = () => {
    let payload = {
      chatroom_id: chatroomID,
      status: 0,
    };
    myClient.blockCR(payload).then(res => {
      console.log('blockCR', res);
      fetchChatroomDetails();
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: 'Member blocked'},
      });
    });
  };

  // this function calls API to unblock a member
  const unblockMember = () => {
    let payload = {
      chatroom_id: chatroomID,
      status: 1,
    };
    myClient.blockCR(payload).then(res => {
      console.log('unblock', res);
      fetchChatroomDetails();
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: 'Member unblocked'},
      });
    });
  };

  // this function shows confirm alert popup to approve DM request
  const handleDMApproveClick = () => {
    Alert.alert(
      'Approve DM request?',
      'Member will be able to send you messages and get notified of the same.',
      [
        {
          text: 'Cancel',
          style: 'default',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            onApprove();
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  // this function shows confirm alert popup to reject DM request
  const handleDMRejectClick = () => {
    Alert.alert(
      'Approve DM request?',
      'Member will be able to send you messages and get notified of the same.',
      [
        {
          text: 'Confirm',
          onPress: async () => {
            onReject();
          },
          style: 'default',
        },
        {
          text: 'Cancel',
          style: 'default',
        },
        {
          text: 'Report and Reject',
          onPress: async () => {
            onReject();
            navigation.navigate('Report', {
              conversationID: chatroomID,
              isDM: chatroomDetails?.chatroom?.type === 10 ? true : false,
            });
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  // this function shows confirm alert popup to approve DM request on click TapToUndo
  const handleBlockMember = () => {
    Alert.alert(
      'Block direct messaging?',
      `Are you sure you do not want to receive new messages from ${
        chatroomDetails?.chatroom?.type === 10
          ? user?.id !== chatroomDetails?.chatroom?.chatroom_with_user?.id
            ? chatroomDetails?.chatroom?.chatroom_with_user?.name
            : chatroomDetails?.chatroom?.member?.name!
          : chatroomDetails?.chatroom?.header
      }?`,
      [
        {
          text: 'Cancel',
          style: 'default',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            blockMember();
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  console.log('chatroomDetails ==?', chatroomDetails?.chatroom_actions);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatlistRef}
        // data={dummyData?.my_chatrooms}
        data={conversations}
        keyExtractor={item => {
          return item?.id?.toString();
        }}
        renderItem={({item, index}) => {
          let isStateIncluded = stateArr.includes(item?.state);
          let isIncluded = selectedMessages.some(
            (val: any) => val?.id === item?.id && !isStateIncluded,
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
                onLongPress={event => {
                  const {pageX, pageY} = event.nativeEvent;
                  dispatch({
                    type: SET_POSITION,
                    body: {pageX: pageX, pageY: pageY},
                  });
                  handleLongPress(isStateIncluded, isIncluded, item);
                }}
                delayLongPress={200}
                onPress={event => {
                  const {pageX, pageY} = event.nativeEvent;
                  dispatch({
                    type: SET_POSITION,
                    body: {pageX: pageX, pageY: pageY},
                  });
                  handleClick(isStateIncluded, isIncluded, item, false);
                }}
                style={isIncluded ? {backgroundColor: '#d7e6f7'} : null}>
                <Messages
                  onScrollToIndex={(index: any) => {
                    flatlistRef.current?.scrollToIndex({animated: true, index});
                  }}
                  isIncluded={isIncluded}
                  item={item}
                  navigation={navigation}
                  openKeyboard={() => {
                    handleClick(isStateIncluded, isIncluded, item, true);
                  }}
                  longPressOpenKeyboard={() => {
                    handleLongPress(isStateIncluded, isIncluded, item);
                  }}
                  removeReaction={() => {
                    removeReaction(item);
                  }}
                  handleTapToUndo={() => {
                    onTapToUndo();
                  }}
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
        getItemLayout={(data, index) => {
          const output = getItemLayout(data, index);
          return output;
        }}
        inverted
      />

      {chatroomDetails?.chatroom?.type !== 10 ? (
        <View>
          {!(Object.keys(chatroomDetails).length === 0) &&
          prevRoute?.name === 'ExploreFeed'
            ? !!!chatroomDetails?.chatroom?.follow_status && (
                <TouchableOpacity
                  onPress={() => {
                    joinSecretChatroom();
                  }}
                  style={[styles.joinBtnContainer, {alignSelf: 'center'}]}>
                  <Image
                    source={require('../../assets/images/join_group3x.png')}
                    style={styles.icon}
                  />
                  <Text style={styles.join}>{'Join'}</Text>
                </TouchableOpacity>
              )
            : null}
          {!(Object.keys(chatroomDetails).length === 0) ? (
            chatroomDetails?.chatroom?.member_can_message &&
            chatroomDetails?.chatroom?.follow_status ? (
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
            ) : !(Object.keys(chatroomDetails).length === 0) &&
              prevRoute?.name === 'HomeFeed' ? (
              <View
                style={{padding: 20, backgroundColor: STYLES.$COLORS.TERTIARY}}>
                <Text
                  style={
                    styles.inviteText
                  }>{`${chatroomDetails?.chatroom?.header} invited you to join this secret group.`}</Text>
                <View style={{marginTop: 10}}>
                  <TouchableOpacity
                    onPress={() => {
                      showJoinAlert();
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      flexGrow: 1,
                      paddingVertical: 10,
                    }}>
                    <Image
                      style={styles.emoji}
                      source={require('../../assets/images/like_icon3x.png')}
                    />
                    <Text style={styles.inviteBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      showRejectAlert();
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      flexGrow: 1,
                      paddingVertical: 10,
                    }}>
                    <Image
                      style={styles.emoji}
                      source={require('../../assets/images/ban_icon3x.png')}
                    />
                    <Text style={styles.inviteBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>
                  Responding is disabled
                </Text>
              </View>
            )
          ) : (
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>Loading...</Text>
            </View>
          )}
        </View>
      ) : chatroomDetails?.chatroom?.type === 10 ? (
        <View>
          {chatroomDetails?.chatroom?.chat_request_state === 0 &&
          (!!chatroomDetails?.chatroom?.chat_requested_by
            ? chatroomDetails?.chatroom?.chat_requested_by[0]?.id !== user?.id
            : null) ? (
            <View
              style={{
                padding: 20,
                backgroundColor: STYLES.$COLORS.TERTIARY,
                marginTop: 10,
              }}>
              <Text
                style={
                  styles.inviteText
                }>{`The sender has sent you a direct messaging request. Approve or respond with a message to get connected. Rejecting this request will not notify the sender.`}</Text>
              <View style={{marginTop: 10}}>
                <TouchableOpacity
                  onPress={() => {
                    handleDMApproveClick();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    flexGrow: 1,
                    paddingVertical: 10,
                  }}>
                  <Image
                    style={styles.emoji}
                    source={require('../../assets/images/like_icon3x.png')}
                  />
                  <Text style={styles.inviteBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleDMRejectClick();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                    flexGrow: 1,
                    paddingVertical: 10,
                  }}>
                  <Image
                    style={styles.emoji}
                    source={require('../../assets/images/ban_icon3x.png')}
                  />
                  <Text style={styles.inviteBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {showDM === false ? (
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>
                Direct messaging among members has been disabled by the
                community manager.
              </Text>
            </View>
          ) : showDM === true &&
            (chatroomDetails?.chatroom?.chat_request_state === 0 ||
              chatroomDetails?.chatroom?.chat_request_state === 2) ? (
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>
                Messaging would be enabled once your request is approved.
              </Text>
            </View>
          ) : (showDM === true &&
              chatroomDetails?.chatroom?.chat_request_state === 1) ||
            chatroomDetails?.chatroom?.chat_request_state === null ? (
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
              chatRequestState={chatroomDetails?.chatroom?.chat_request_state}
              chatroomType={chatroomDetails?.chatroom?.type}
            />
          ) : (
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>Loading...</Text>
            </View>
          )}
        </View>
      ) : null}
      {/* Chatroom Action Modal */}
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
              {filteredChatroomActions?.map((val: any, index: any) => {
                return (
                  <TouchableOpacity
                    onPress={async () => {
                      if (val?.id === 2) {
                        setModalVisible(false);
                        navigation.navigate('ViewParticipants', {
                          chatroomID: chatroomID,
                          isSecret: isSecret,
                        });
                      } else if (val?.id === 9 || val?.id === 15) {
                        if (isSecret) {
                          leaveSecretChatroom();
                        } else if (!isSecret) {
                          leaveChatroom();
                        }

                        setModalVisible(false);
                      } else if (val?.id === 4) {
                        if (!isSecret) {
                          joinChatroom();
                        }
                        setModalVisible(false);
                      } else if (val?.id === 6) {
                        await muteNotifications();
                        setModalVisible(false);
                      } else if (val?.id === 8) {
                        await unmuteNotifications();
                        setModalVisible(false);
                      } else if (val?.id === 27) {
                        await handleBlockMember();
                        setModalVisible(false);
                      } else if (val?.id === 28) {
                        await unblockMember();
                        setModalVisible(false);
                      }
                    }}
                    key={val?.id}
                    style={styles.filtersView}>
                    <Text style={styles.filterText}>{val?.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Report Action Modal */}
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
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Report', {
                    conversationID: selectedMessages[0].id,
                  });
                  dispatch({type: SELECTED_MESSAGES, body: []});
                  setReportModalVisible(false);
                  // handleReportModalClose()
                }}
                style={styles.filtersView}>
                <Text style={styles.filterText}>Report Message</Text>
              </TouchableOpacity>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Message Reaction Modal */}
      <Modal
        transparent={true}
        visible={isReact}
        onRequestClose={() => {
          setIsReact(false);
        }}>
        <Pressable
          style={styles.reactionCenteredView}
          onPress={handleReactionModalClose}>
          <View>
            <Pressable
              onPress={() => {}}
              style={[
                styles.reactionModalView,
                {
                  top:
                    position.y > Layout.window.height / 2
                      ? Platform.OS === 'ios'
                        ? position.y - 150
                        : position.y - 100
                      : position.y - 10,
                },
              ]}>
              {reactionArr?.map((val: any, index: any) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      sendReaction(val);
                    }}
                    key={val + index}
                    style={styles.reactionFiltersView}>
                    <Text style={styles.filterText}>{val}</Text>
                  </TouchableOpacity>
                );
              })}
              <Pressable
                style={[
                  {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 10,
                    marginTop: 8,
                  },
                ]}
                onPress={() => {
                  setIsOpen(true);
                  setIsReact(false);
                }}>
                <Image
                  style={{
                    height: 25,
                    width: 25,
                    resizeMode: 'contain',
                  }}
                  source={require('../../assets/images/add_more_emojis3x.png')}
                />
              </Pressable>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Emoji Keyboard Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={() => {
          setIsOpen(false);
        }}>
        <Pressable
          style={styles.emojiCenteredView}
          onPress={() => {
            setIsOpen(false);
          }}>
          <View>
            <Pressable onPress={() => {}} style={[styles.emojiModalView]}>
              <View style={{height: 350}}>
                <EmojiKeyboard
                  categoryPosition="top"
                  onEmojiSelected={handlePick}
                />
              </View>
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
