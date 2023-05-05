import {
  CommonActions,
  StackActions,
  useIsFocused,
} from '@react-navigation/native';
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
  firebaseConversation,
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
  FIREBASE_CONVERSATIONS_SUCCESS,
  LONG_PRESSED,
  REACTION_SENT,
  REJECT_INVITE_SUCCESS,
  SELECTED_MESSAGES,
  SET_DM_PAGE,
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
import {
  EXPLORE_FEED,
  HOMEFEED,
  REPORT,
  VIEW_PARTICIPANTS,
} from '../../constants/Screens';
import {
  APPROVE_DM_REQUEST,
  APPROVE_REQUEST_MESSAGE,
  BLOCK_DM_REQUEST,
  DM_REQUEST_SENT_MESSAGE,
  JOIN_CHATROOM,
  JOIN_CHATROOM_MESSAGE,
  REJECT_INVITATION,
  REJECT_INVITATION_MESSAGE,
} from '../../constants/Strings';
import {DM_ALL_MEMBERS} from '../../constants/Screens';

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
  const {user, community} = useAppSelector(state => state.homefeed);

  let chatroomType = chatroomDetails?.chatroom?.type;
  let chatroomFollowStatus = chatroomDetails?.chatroom?.follow_status;
  let memberCanMessage = chatroomDetails?.chatroom?.member_can_message;
  let chatroomWithUser = chatroomDetails?.chatroom?.chatroom_with_user;

  {
    /* `{? = then}`, `{: = else}`  */
  }
  {
    /* 
      if DM ? 
        if userID !=== chatroomWithUserID ? 
          chatroomWithUserName 
        : memberName
      : chatroomHeaderName  
  */
  }
  let chatroomName =
    chatroomType === 10
      ? user?.id !== chatroomWithUser?.id
        ? chatroomWithUser?.name
        : chatroomDetails?.chatroom?.member?.name!
      : chatroomDetails?.chatroom?.header;

  {
    /* `{? = then}`, `{: = else}`  */
  }
  {
    /* 
          if DM ? 
            if userID !=== chatroomWithUserID ? 
              chatroomWithUserImageURL 
            : memberImageURL
          : null  
      */
  }
  let chatroomProfile =
    chatroomType === 10
      ? user?.id !== chatroomWithUser?.id
        ? chatroomWithUser?.image_url
        : chatroomDetails?.chatroom?.member?.image_url!
      : null;

  let routes = navigation.getState()?.routes;
  let previousRoute = routes[routes.length - 2];

  let isSecret = chatroomDetails?.chatroom?.is_secret;

  let notIncludedActionsID = [3];
  let filteredChatroomActions = chatroomDetails?.chatroom_actions?.filter(
    (val: any) => !notIncludedActionsID?.includes(val?.id),
  );

  // Initial header of chatroom screen
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
              if (chatroomType === 10) {
                if (previousRoute?.name === DM_ALL_MEMBERS) {
                  const popAction = StackActions.pop(2);
                  navigation.dispatch(popAction);
                } else {
                  navigation.goBack();
                }
              } else {
                navigation.goBack();
              }
            }}>
            <Image
              source={require('../../assets/images/back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          {!(Object.keys(chatroomDetails).length === 0) ? (
            <View style={styles.alignRow}>
              {chatroomType === 10 ? (
                <View style={styles.profile}>
                  <Image
                    source={
                      !!chatroomProfile
                        ? {uri: chatroomProfile}
                        : require('../../assets/images/default_pic.png')
                    }
                    style={styles.avatar}
                  />
                </View>
              ) : null}

              <View style={styles.chatRoomInfo}>
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={{
                    color: STYLES.$COLORS.PRIMARY,
                    fontSize: STYLES.$FONT_SIZES.LARGE,
                    fontFamily: STYLES.$FONT_TYPES.BOLD,
                    maxWidth: 150,
                  }}>
                  {chatroomName}
                </Text>
                {chatroomType !== 10 ? (
                  <Text
                    style={{
                      color: STYLES.$COLORS.MSG,
                      fontSize: STYLES.$FONT_SIZES.SMALL,
                      fontFamily: STYLES.$FONT_TYPES.LIGHT,
                    }}>
                    {`${chatroomDetails?.chatroom?.participants_count} participants`}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      ),
      headerRight: () =>
        filteredChatroomActions?.length > 0 && (
          <View style={styles.headerRight}>
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

  // Selected header of chatroom screen
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
              memberCanMessage &&
              chatroomFollowStatus && (
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

  //this function to update page for pagination in redux for GroupFeed or DMFeed
  const updatePageInRedux = () => {
    if (chatroomType === 10) {
      dispatch({type: SET_DM_PAGE, body: 1});
    } else {
      dispatch({type: SET_PAGE, body: 1});
    }
  };

  //this function fetchConversations when we first move inside Chatroom
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
        member_id: user?.id,
        collabcard_type: chatroomType,
      });

      updatePageInRedux();

      //if isDM
      if (chatroomType === 10) {
        dispatch(
          getDMFeedData({community_id: community?.id, page: 1}, false) as any,
        );
      } else {
        await dispatch(getHomeFeedData({page: 1}, false) as any);
      }
    }
    return response;
  }

  //this function fetchChatroomDetails when we first move inside Chatroom
  async function fetchChatroomDetails() {
    let payload = {chatroom_id: chatroomID};
    let response = await dispatch(getChatroom(payload) as any);
    return response;
  }

  // this useLayoutEffect calls API's before printing UI Layout
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

  // this useEffect update initial header when we get chatroomDetails.
  useEffect(() => {
    setInitialHeader();
  }, [chatroomDetails]);

  // this useEffect call API to InputBox based on showDM key.
  useEffect(() => {
    async function callApi() {
      if (chatroomType == 10) {
        let response = await myClient.canDmFeed({
          req_from: 'chatroom',
          chatroom_id: chatroomID,
          community_id: community?.id,
          member_id: chatroomWithUser?.id,
        });
        console.log('cta', response);
        if (!!response?.cta) {
          setShowDM(response?.show_dm);
        }
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

  // this useEffect scroll to Index of latest message when we send the message.
  useEffect(() => {
    if (conversations.length > 0) {
      flatlistRef?.current?.scrollToIndex({
        animated: false,
        index: 0,
      });
    }
  }, [messageSent]);
  // this useEffect update headers when we longPress or update selectedMessages array.
  useEffect(() => {
    if (selectedMessages.length === 0) {
      setInitialHeader();
    } else if (!!isLongPress) {
      setSelectedHeader();
    }
  }, [isLongPress, selectedMessages]);

  //useffect includes firebase realtime listener
  useEffect(() => {
    const query = ref(db, `/collabcards/${chatroomID}`);
    return onValue(query, async (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        let firebaseData = snapshot.val();
        let payload = {
          chatroomID: chatroomID,
          conversationId: firebaseData?.collabcard?.answer_id,
        };
        const res = await dispatch(firebaseConversation(payload, false) as any);
      }
    });
  }, []);

  // this useffect updates routes, previousRoute variables when we come to chatroom.
  useEffect(() => {
    if (isFocused) {
      routes = navigation.getState()?.routes;
      previousRoute = routes[routes.length - 2];
    }
  }, [isFocused]);

  //function calls paginatedConversations action which internally calls getConversation to update conversation array with the new data.
  async function paginatedData(newPage: number) {
    let payload = {
      chatroomID: chatroomID,
      page: 50,
      conversation_id: conversations[conversations.length - 1]?.id,
      scroll_direction: 0,
    };
    let response = await dispatch(paginatedConversations(payload, true) as any);
    return response;
  }

  // function shows loader in between calling the API and getting the response
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

  //function checks the pagination logic, if it verifies the condition then call loadData
  const handleLoadMore = () => {
    if (!isLoading && conversations.length > 0) {
      // checking if conversations length is greater the 15 as it convered all the screen sizes of mobiles, and pagination API will never call if screen is not full messages.
      if (conversations.length > 15) {
        const newPage = page + 1;
        setPage(newPage);
        loadData(newPage);
      }
    }
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
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            community_id: community?.id,
            order_type: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
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
          updatePageInRedux();
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
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            community_id: community?.id,
            order_type: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
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
          updatePageInRedux();
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
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            community_id: community?.id,
            order_type: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
          await dispatch(getHomeFeedData({page: 1}) as any);
        } else {
          updatePageInRedux();
          await dispatch(getHomeFeedData({page: 1}) as any);
        }
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes:
              previousRoute?.name === EXPLORE_FEED
                ? [{name: HOMEFEED}, {name: previousRoute?.name}]
                : [{name: previousRoute?.name}],
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

        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            community_id: community?.id,
            order_type: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
          await dispatch(getHomeFeedData({page: 1}) as any);
        } else {
          updatePageInRedux();
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
      JOIN_CHATROOM,
      JOIN_CHATROOM_MESSAGE,
      [
        {
          text: 'Cancel',
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
            updatePageInRedux();
            await dispatch(getChatroom({chatroom_id: chatroomID}) as any);
            await dispatch(getHomeFeedData({page: 1}, false) as any);
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );

  const showRejectAlert = () =>
    Alert.alert(
      REJECT_INVITATION,
      REJECT_INVITATION_MESSAGE,
      [
        {
          text: 'Cancel',
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
      },
    );

  // this function calls sendReactionAPI
  const sendReactionAPI = async (consversationID: any, reaction: any) => {
    const res = await myClient.addAction({
      chatroom_id: chatroomID,
      conversation_id: consversationID,
      reaction: reaction,
    });
  };

  // this function calls removeReactionAPI
  const removeReactionAPI = async (consversationID: any, reaction: any) => {
    const res = await myClient.removeAction({
      chatroom_id: chatroomID,
      conversation_id: consversationID,
      reaction: reaction,
    });
  };

  // this function is for sending a reaction from conversation
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

  // this function is for removing a reaction from conversation
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

  //this function is for sending a reaction to a message
  const handlePick = (emojiObject: any) => {
    sendReaction(emojiObject?.emoji);
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    setIsOpen(false);
  };

  //this function handles LongPress event on conversations
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

  //this function handles onPress event on conversations
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

  // this function calls API to approve DM request
  const onApprove = async () => {
    let response = await myClient.requestDmAction({
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

    await fetchData();
    await fetchChatroomDetails();

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
      APPROVE_DM_REQUEST,
      APPROVE_REQUEST_MESSAGE,
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
      APPROVE_DM_REQUEST,
      APPROVE_REQUEST_MESSAGE,
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
              isDM: chatroomType === 10 ? true : false,
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
    {
      /* `{? = then}`, `{: = else}`  */
    }
    // Logic for alert message name
    {
      /* 
       if DM ? 
        if userID !=== chatroomWithUserID ? 
          chatroomWithUserName 
        : memberName
      : chatroomHeaderName              
    */
    }
    Alert.alert(
      BLOCK_DM_REQUEST,
      `Are you sure you do not want to receive new messages from ${chatroomName}?`,
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
        inverted
      />

      {/* if chatroomType !== 10 (Not DM) then show group bottom changes, else if chatroomType === 10 (DM) then show DM bottom changes */}
      {chatroomType !== 10 ? (
        <View>
          {!(Object.keys(chatroomDetails).length === 0) &&
          previousRoute?.name === EXPLORE_FEED
            ? !!!chatroomFollowStatus && (
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
            memberCanMessage && chatroomFollowStatus ? (
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
              previousRoute?.name === HOMEFEED ? (
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
      ) : chatroomType === 10 ? (
        <View>
          {/* `{? = then}`, `{: = else}`  */}
          {/* 
              if chat_request_state === 0 (Not requested yet) &&
              (chat_requested_by !== null
                ? chat_requested_by[0]?.id !== user?.id (TRUE or FALSE)
                : null (FALSE) )
          */}
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
              <Text style={styles.inviteText}>{DM_REQUEST_SENT_MESSAGE}</Text>
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
              chatroomType={chatroomType}
              isPrivateMember={chatroomDetails?.chatroom?.is_private_member}
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
                        navigation.navigate(VIEW_PARTICIPANTS, {
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
                      } else if (val?.id === 21) {
                        //View Profile code
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
                  navigation.navigate(REPORT, {
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
