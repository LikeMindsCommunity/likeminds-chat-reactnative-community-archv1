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
  Keyboard,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  BackHandler,
  ScrollView,
  Platform,
  LogBox,
} from 'react-native';
import {Image as CompressedImage} from 'react-native-compressor';
import {myClient} from '../../..';
import {
  SHOW_LIST_REGEX,
  copySelectedMessages,
  fetchResourceFromURI,
  formatTime,
} from '../../commonFuctions';
import InputBox from '../../components/InputBox';
import Messages from '../../components/Messages';
import ToastMessage from '../../components/ToastMessage';
import STYLES from '../../constants/Styles';
import {useAppDispatch, useAppSelector} from '../../../store';
import {
  firebaseConversation,
  getChatroom,
  getConversations,
  paginatedConversations,
} from '../../store/actions/chatroom';
import {styles} from './styles';
import Clipboard from '@react-native-clipboard/clipboard';
import {DataSnapshot, onValue, ref} from 'firebase/database';
import {
  getDMFeedData,
  getHomeFeedData,
  initAPI,
} from '../../store/actions/homefeed';
import {
  ACCEPT_INVITE_SUCCESS,
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  FIREBASE_CONVERSATIONS_SUCCESS,
  LONG_PRESSED,
  REACTION_SENT,
  REJECT_INVITE_SUCCESS,
  SELECTED_MESSAGES,
  SET_DM_PAGE,
  SET_EDIT_MESSAGE,
  SET_EXPLORE_FEED_PAGE,
  SET_FILE_UPLOADING_MESSAGES,
  SET_IS_REPLY,
  SET_PAGE,
  SET_POSITION,
  SET_REPLY_MESSAGE,
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
  CHATROOM,
  EXPLORE_FEED,
  HOMEFEED,
  REPORT,
  VIEW_PARTICIPANTS,
} from '../../constants/Screens';
import {
  COMMUNITY_MANAGER_DISABLED_CHAT,
  DM_REQUEST_SENT_MESSAGE,
  JOIN_CHATROOM,
  JOIN_CHATROOM_MESSAGE,
  REJECT_INVITATION,
  REJECT_INVITATION_MESSAGE,
  REQUEST_SENT,
  CANCEL_BUTTON,
  CONFIRM_BUTTON,
  APPROVE_BUTTON,
  REJECT_BUTTON,
  FAILED,
  VIDEO_TEXT,
  PDF_TEXT,
  AUDIO_TEXT,
  IMAGE_TEXT,
  SUCCESS,
  REQUEST_DM_LIMIT,
  WARNING_MSG_PRIVATE_CHATROOM,
  WARNING_MSG_PUBLIC_CHATROOM,
} from '../../constants/Strings';
import {DM_ALL_MEMBERS} from '../../constants/Screens';
import ApproveDMRequestModal from '../../customModals/ApproveDMRequest';
import BlockDMRequestModal from '../../customModals/BlockDMRequest';
import RejectDMRequestModal from '../../customModals/RejectDMRequest';
import {BUCKET, POOL_ID, REGION} from '../../aws-exports';
import {CognitoIdentityCredentials, S3} from 'aws-sdk';
import AWS from 'aws-sdk';
import {FlashList} from '@shopify/flash-list';
import WarningMessageModal from '../../customModals/WarningMessage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Data {
  id: string;
  title: string;
}

interface ChatRoom {
  navigation: any;
  route: any;
}

interface UploadResource {
  selectedImages: any;
  conversationID: any;
  chatroomID: any;
  selectedFilesToUpload: any;
  uploadingFilesMessages: any;
  isRetry: boolean;
}

const ChatRoom = ({navigation, route}: ChatRoom) => {
  const flatlistRef = useRef<any>(null);
  let refInput = useRef<any>();

  const db = myClient?.fbInstance();
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
  const [DMApproveAlertModalVisible, setDMApproveAlertModalVisible] =
    useState(false);
  const [DMRejectAlertModalVisible, setDMRejectAlertModalVisible] =
    useState(false);
  const [DMBlockAlertModalVisible, setDMBlockAlertModalVisible] =
    useState(false);
  const [showDM, setShowDM] = useState<any>(null);
  const [showList, setShowList] = useState<any>(null);
  const [isMessagePrivately, setIsMessagePrivately] = useState<any>(false);
  const [isEditable, setIsEditable] = useState<any>(false);
  const [isWarningMessageModalState, setIsWarningMessageModalState] =
    useState(false);

  const reactionArr = ['❤️', '😂', '😮', '😢', '😠', '👍'];

  const {
    chatroomID,
    isInvited,
    previousChatroomID,
    navigationFromNotification,
  } = route.params;
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
  }: any = useAppSelector(state => state.chatroom);
  const {user, community, memberRights} = useAppSelector(
    state => state.homefeed,
  );
  const {uploadingFilesMessages}: any = useAppSelector(state => state.upload);

  let chatroomType = chatroomDetails?.chatroom?.type;
  let chatroomFollowStatus = chatroomDetails?.chatroom?.follow_status;
  let memberCanMessage = chatroomDetails?.chatroom?.member_can_message;
  let chatroomWithUser = chatroomDetails?.chatroom?.chatroom_with_user;
  let chatRequestState = chatroomDetails?.chatroom?.chat_request_state;

  AWS.config.update({
    region: REGION, // Replace with your AWS region, e.g., 'us-east-1'
    credentials: new CognitoIdentityCredentials({
      IdentityPoolId: POOL_ID, // Replace with your Identity Pool ID
    }),
  });

  const s3 = new S3();

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
              dispatch({type: SET_IS_REPLY, body: {isReply: false}});
              dispatch({
                type: SET_REPLY_MESSAGE,
                body: {replyMessage: ''},
              });
              Keyboard.dismiss();
              backAction();
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
        let showCopyIcon = true;
        let isDelete = false;
        let isFirstMessageDeleted = selectedMessages[0]?.deleted_by;
        let isSelectedMessageEditable = false;
        let selectedMessagesLength = selectedMessages.length;

        //Logic to set isSelectedMessageEditable true/false, based on that we will show edit icon.
        if (selectedMessagesLength === 1) {
          if (
            selectedMessages[0].member.id === user?.id &&
            !!selectedMessages[0].answer
          ) {
            isSelectedMessageEditable = true;
          } else {
            isSelectedMessageEditable = false;
          }
        } else {
          isSelectedMessageEditable = false;
        }

        //Logic to set isCopy, showCopyIcon, isDelete true/false, based on that we will show respective icons.
        for (let i = 0; i < selectedMessagesLength; i++) {
          if (selectedMessages[i].attachment_count > 0) {
            showCopyIcon = false;
          }

          if (!!!selectedMessages[i]?.deleted_by && showCopyIcon) {
            isCopy = true;
          } else if (!showCopyIcon) {
            isCopy = false;
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
            !!!isFirstMessageDeleted
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
              !!!isFirstMessageDeleted &&
              memberCanMessage &&
              chatroomFollowStatus && (
                <TouchableOpacity
                  onPress={() => {
                    if (len > 0) {
                      setReplyChatID(selectedMessages[0]?.id);
                      dispatch({type: SET_IS_REPLY, body: {isReply: true}});
                      dispatch({
                        type: SET_REPLY_MESSAGE,
                        body: {replyMessage: selectedMessages[0]},
                      });
                      dispatch({type: SELECTED_MESSAGES, body: []});
                      dispatch({type: LONG_PRESSED, body: false});
                      setInitialHeader();
                      refInput.current.focus();
                    }
                  }}>
                  <Image
                    source={require('../../assets/images/reply_icon3x.png')}
                    style={styles.threeDots}
                  />
                </TouchableOpacity>
              )}

            {len === 1 && !!!isFirstMessageDeleted && isCopy ? (
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

            {isSelectedMessageEditable &&
            (chatroomType === 10 ? !!chatRequestState : true) ? ( // this condition checks in case of DM, chatRequestState != 0 && chatRequestState != null then only show edit Icon
              <TouchableOpacity
                onPress={() => {
                  setIsEditable(true);
                  dispatch({
                    type: SET_EDIT_MESSAGE,
                    body: {editConversation: {...selectedMessages[0]}},
                  });
                  dispatch({type: SELECTED_MESSAGES, body: []});
                  refInput.current.focus();
                }}>
                <Image
                  source={require('../../assets/images/edit_icon3x.png')}
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            ) : null}
            {isDelete && (
              <TouchableOpacity
                onPress={async () => {
                  const res = await myClient
                    .deleteConversation({
                      conversationIds: selectedMessagesIDArr,
                      reason: 'none',
                    })
                    .then(async () => {
                      dispatch({type: SELECTED_MESSAGES, body: []});
                      dispatch({type: LONG_PRESSED, body: false});
                      setInitialHeader();
                      let payload = {
                        chatroomID: chatroomID,
                        paginateBy: conversations.length * 2,
                        topNavigate: false,
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
            {len === 1 && !!!isFirstMessageDeleted && (
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
    let payload = {chatroomID: chatroomID, paginateBy: 100, topNavigate: false};
    let response = await dispatch(
      getConversations(
        payload,
        showLoaderVal != undefined && showLoaderVal == false ? false : true,
      ) as any,
    );
    if (!isInvited) {
      const response = await myClient?.markReadChatroom({
        chatroomId: chatroomID,
      });

      const res = await myClient?.chatroomSeen({
        collabcardId: chatroomID,
        memberId: user?.id,
        collabcardType: chatroomType,
      });

      updatePageInRedux();

      //if isDM
      if (chatroomType === 10) {
        dispatch(getDMFeedData({page: 1}, false) as any);
      } else {
        await dispatch(getHomeFeedData({page: 1}, false) as any);
      }
    }
    return response;
  }

  //this function fetchChatroomDetails when we first move inside Chatroom
  async function fetchChatroomDetails() {
    let payload = {chatroomId: chatroomID};
    let response = await dispatch(getChatroom(payload) as any);
    return response;
  }

  // this function fetch initiate API
  async function fetchInitAPI() {
    //this line of code is for the sample app only, pass your userUniqueID instead of this.
    const UUID = await AsyncStorage.getItem('userUniqueID');

    let payload = {
      userUniqueId: UUID, // user unique ID
      userName: '', // user name
      isGuest: false,
    };
    let res = await dispatch(initAPI(payload) as any);
    return res;
  }

  // this useLayoutEffect calls API's before printing UI Layout
  useLayoutEffect(() => {
    dispatch({
      type: CLEAR_CHATROOM_CONVERSATION,
      body: {conversations: []},
    });
    dispatch({
      type: CLEAR_CHATROOM_DETAILS,
      body: {chatroomDetails: {}},
    });
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    dispatch({type: SET_IS_REPLY, body: {isReply: false}});
    dispatch({
      type: SET_REPLY_MESSAGE,
      body: {replyMessage: ''},
    });
  }, []);

  //this useEffect fetch chatroom details only after initiate API got fetched if `navigation from Notification` else fetch chatroom details
  useEffect(() => {
    const invokeFunction = async () => {
      if (navigationFromNotification) {
        await fetchInitAPI();
        fetchChatroomDetails();
        setInitialHeader();
      } else {
        fetchChatroomDetails();
        setInitialHeader();
      }
    };
    invokeFunction();
  }, [navigation]);

  //Logic for navigation backAction
  function backAction() {
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    if (chatroomType === 10) {
      if (previousRoute?.name === DM_ALL_MEMBERS) {
        const popAction = StackActions.pop(2);
        navigation.dispatch(popAction);
      } else {
        if (previousChatroomID) {
          const popAction = StackActions.pop(1);
          navigation.dispatch(popAction);
          navigation.push(CHATROOM, {
            chatroomID: previousChatroomID,
          });
        } else {
          navigation.goBack();
        }
      }
    } else {
      navigation.goBack();
    }
  }

  //Navigation gesture back handler for android
  useEffect(() => {
    function backActionCall() {
      Keyboard.dismiss();
      if (chatroomType === 10) {
        if (previousRoute?.name === DM_ALL_MEMBERS) {
          const popAction = StackActions.pop(2);
          navigation.dispatch(popAction);
        } else {
          if (previousChatroomID) {
            const popAction = StackActions.pop(1);
            navigation.dispatch(popAction);
            navigation.push(CHATROOM, {
              chatroomID: previousChatroomID,
            });
          } else {
            navigation.goBack();
          }
        }
      } else {
        navigation.goBack();
      }
      return true;
    }

    const backHandlerAndroid = BackHandler.addEventListener(
      'hardwareBackPress',
      backActionCall,
    );
    return () => backHandlerAndroid.remove();
  }, [chatroomType]);

  // this useEffect update initial header when we get chatroomDetails.
  useEffect(() => {
    setInitialHeader();
  }, [chatroomDetails]);

  // this useEffect call API to show InputBox based on showDM key.
  useEffect(() => {
    async function callApi() {
      if (chatroomType == 10) {
        let apiRes = await myClient?.canDmFeed({
          reqFrom: 'chatroom',
          chatroomId: chatroomID,
          memberId: chatroomWithUser?.id,
        });
        let response = apiRes?.data;
        if (!!response?.cta) {
          setShowDM(response?.show_dm);
        }
      } else if (chatroomType == 0 || chatroomType == 7) {
        if (!!community?.id) {
          let payload = {
            page: 1,
          };
          const res = await dispatch(getDMFeedData(payload, false) as any);

          if (!!res) {
            let apiRes = await myClient?.checkDMStatus({
              requestFrom: 'group_channel',
            });
            let response = apiRes?.data;
            if (!!response) {
              let routeURL = response?.cta;
              const hasShowList = SHOW_LIST_REGEX.test(routeURL);
              if (hasShowList) {
                const showListValue = routeURL.match(SHOW_LIST_REGEX)[1];
                setShowList(showListValue);
              }
              setShowDM(response?.show_dm);
            }
          }
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
        let conversationID = firebaseData?.collabcard?.answer_id;

        let payload = {
          chatroomId: chatroomID,
          conversationId: firebaseData?.collabcard?.answer_id,
        };
        if (conversationID) {
          const res = await dispatch(
            firebaseConversation(payload, false) as any,
          );
        }
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

  //This useEffect has logic to or hide message privately when long press on a message
  useEffect(() => {
    if (selectedMessages.length === 1) {
      let selectedMessagesMember = selectedMessages[0]?.member;
      if (
        showDM &&
        selectedMessagesMember?.id !== user?.id &&
        !selectedMessages[0]?.deleted_by
      ) {
        if (showList == 2 && selectedMessagesMember?.state === 1) {
          setIsMessagePrivately(true);
        } else if (showList == 1) {
          setIsMessagePrivately(true);
        } else {
          setIsMessagePrivately(false);
        }
      } else {
        setIsMessagePrivately(false);
      }
    }
  }, [selectedMessages, showDM, showList]);

  //function calls paginatedConversations action which internally calls getConversation to update conversation array with the new data.
  async function paginatedData(newPage: number) {
    let payload = {
      chatroomID: chatroomID,
      conversationID: conversations[conversations.length - 1]?.id,
      scrollDirection: 0,
      paginateBy: 50,
      topNavigate: false,
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
      collabcardId: chatroomID,
      memberId: user?.id,
      value: false,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            orderType: 0,
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

  const showWarningModal = () => {
    setIsWarningMessageModalState(true);
  };

  const hideWarningModal = () => {
    setIsWarningMessageModalState(false);
  };

  const leaveSecretChatroom = async () => {
    const payload: any = {
      chatroomId: chatroomID,
      isSecret: isSecret,
    };
    const res = await myClient
      .leaveSecretChatroom(payload)
      .then(async () => {
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            orderType: 0,
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
      collabcardId: chatroomID,
      memberId: user?.id,
      value: true,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            orderType: 0,
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
      collabcardId: chatroomID,
      memberId: user?.id,
      value: true,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        let payload = {chatroomId: chatroomID};
        await dispatch(getChatroom(payload) as any);

        let payload1 = {
          chatroomID: chatroomID,
          paginateBy: 100,
          topNavigate: false,
        };
        await dispatch(getConversations(payload1, true) as any);

        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            orderType: 0,
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
      chatroomId: chatroomID,
      value: true,
    };
    myClient
      .muteChatroom(payload)
      .then((res: any) => {
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
      chatroomId: chatroomID,
      value: false,
    };
    const res = await myClient
      .muteChatroom(payload)
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
          text: CANCEL_BUTTON,
          style: 'default',
        },
        {
          text: CONFIRM_BUTTON,
          onPress: async () => {
            let res = await myClient?.inviteAction({
              channelId: `${chatroomID}`,
              inviteStatus: 1,
            });
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Invitation accepted'},
            });

            dispatch({type: ACCEPT_INVITE_SUCCESS, body: chatroomID});
            updatePageInRedux();
            await dispatch(getChatroom({chatroomId: chatroomID}) as any);
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
          text: CANCEL_BUTTON,
          style: 'cancel',
        },
        {
          text: CONFIRM_BUTTON,
          onPress: async () => {
            let res = await myClient?.inviteAction({
              channelId: `${chatroomID}`,
              inviteStatus: 2,
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
    const res = await myClient?.putReaction({
      conversationId: consversationID,
      reaction: reaction,
    });
  };

  // this function calls removeReactionAPI
  const removeReactionAPI = async (consversationID: any, reaction: any) => {
    const res = await myClient?.deleteReaction({
      chatroomId: chatroomID,
      conversationId: consversationID,
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
  const removeReaction = (
    item: any,
    reactionArr: any,
    removeFromList?: any,
  ) => {
    let previousMsg = item;
    let changedMsg;
    let val;

    if (item?.reactions?.length > 0) {
      let index = item?.reactions.findIndex(
        (val: any) => val?.member?.id === user?.id,
      );

      // this condition checks if clicked reaction ID matches the findIndex ID
      let isIndexMatches =
        item?.reactions[index]?.member?.id === reactionArr?.id;

      let isIndexExist = index !== -1 ? true : false;

      // check condition user has a reaction && isIndexMatches(true if clicked reaction ID is same as findReactionID)
      if (
        (isIndexExist && isIndexMatches) || // condition to remove reaction from list of all reactions
        (isIndexExist && !!removeFromList && isIndexMatches) // condition to remove reaction from list specific reaction
      ) {
        let tempArr = [...item?.reactions];

        val = tempArr[index];

        if (index !== undefined || isIndexExist) {
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
        removeReactionAPI(previousMsg?.id, val?.reaction);
      }
    }
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
    selectedMessages: any,
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
    selectedMessages: any,
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
    let response = await myClient?.sendDMRequest({
      chatroomId: chatroomID,
      chatRequestState: 1,
    });
    fetchData();
    fetchChatroomDetails();

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: {chatRequestState: 1},
    });
  };

  // this function calls API to reject DM request
  const onReject = async () => {
    let response = await myClient?.sendDMRequest({
      chatroomId: chatroomID,
      chatRequestState: 2,
    });
    fetchData();
    fetchChatroomDetails();

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: {chatRequestState: 2},
    });
  };

  // this function calls API to approve DM request on click TapToUndo
  const onTapToUndo = async () => {
    let response = await myClient?.blockMember({
      chatroomId: chatroomID,
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
      chatroomId: chatroomID,
      status: 0,
    };
    myClient?.blockMember(payload).then((res: any) => {
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
      chatroomId: chatroomID,
      status: 1,
    };
    myClient?.blockMember(payload).then((res: any) => {
      fetchChatroomDetails();
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: 'Member unblocked'},
      });
    });
  };

  // this function shows confirm alert popup to approve DM request
  const handleDMApproveClick = () => {
    showDMApproveAlert();
  };

  // this function shows confirm alert popup to reject DM request
  const handleDMRejectClick = () => {
    showDMRejectAlert();
  };

  // this function shows confirm alert popup to approve DM request on click TapToUndo
  const handleBlockMember = () => {
    showDMBlockAlert();
  };

  const showDMApproveAlert = () => {
    setDMApproveAlertModalVisible(true);
  };

  const hideDMApproveAlert = () => {
    setDMApproveAlertModalVisible(false);
  };

  const showDMRejectAlert = () => {
    setDMRejectAlertModalVisible(true);
  };

  const hideDMRejectAlert = () => {
    setDMRejectAlertModalVisible(false);
  };

  const showDMBlockAlert = () => {
    setDMBlockAlertModalVisible(true);
  };

  const hideDMBlockAlert = () => {
    setDMBlockAlertModalVisible(false);
  };

  const uploadResource = async ({
    selectedImages,
    conversationID,
    chatroomID,
    selectedFilesToUpload,
    uploadingFilesMessages,
    isRetry,
  }: UploadResource) => {
    LogBox.ignoreLogs(['new NativeEventEmitter']);
    for (let i = 0; i < selectedImages?.length; i++) {
      let item = selectedImages[i];
      let attachmentType = isRetry ? item?.type : item?.type?.split('/')[0];
      let docAttachmentType = isRetry ? item?.type : item?.type?.split('/')[1];
      let thumbnailURL = item?.thumbnail_url;
      let name =
        attachmentType === IMAGE_TEXT
          ? item.fileName
          : attachmentType === VIDEO_TEXT
          ? item.fileName
          : docAttachmentType === PDF_TEXT
          ? item.name
          : null;
      let path = `files/collabcard/${chatroomID}/conversation/${conversationID}/${name}`;
      let thumbnailUrlPath = `files/collabcard/${chatroomID}/conversation/${conversationID}/${thumbnailURL}`;

      //image compression
      const compressedImgURI = await CompressedImage.compress(item.uri, {
        compressionMethod: 'auto',
      });
      const compressedImg = await fetchResourceFromURI(compressedImgURI);

      //for video thumbnail
      let thumbnailUrlImg = null;
      if (thumbnailURL && attachmentType === VIDEO_TEXT) {
        thumbnailUrlImg = await fetchResourceFromURI(thumbnailURL);
      }

      const params = {
        Bucket: BUCKET,
        Key: path,
        Body: compressedImg,
        ACL: 'public-read-write',
        ContentType: item?.type, // Replace with the appropriate content type for your file
      };

      //for video thumbnail
      const thumnnailUrlParams: any = {
        Bucket: BUCKET,
        Key: thumbnailUrlPath,
        Body: thumbnailUrlImg,
        ACL: 'public-read-write',
        ContentType: 'image/jpeg', // Replace with the appropriate content type for your file
      };

      try {
        let getVideoThumbnailData = null;

        if (thumbnailURL && attachmentType === VIDEO_TEXT) {
          getVideoThumbnailData = await s3.upload(thumnnailUrlParams).promise();
        }
        const data = await s3.upload(params).promise();
        let awsResponse = data.Location;
        if (awsResponse) {
          let fileType = '';
          if (docAttachmentType === PDF_TEXT) {
            fileType = PDF_TEXT;
          } else if (attachmentType === AUDIO_TEXT) {
            fileType = AUDIO_TEXT;
          } else if (attachmentType === VIDEO_TEXT) {
            fileType = VIDEO_TEXT;
          } else if (attachmentType === IMAGE_TEXT) {
            fileType = IMAGE_TEXT;
          }

          let payload = {
            conversationId: conversationID,
            filesCount: selectedImages?.length,
            index: i + 1,
            meta:
              fileType === VIDEO_TEXT
                ? {
                    size: selectedFilesToUpload[i]?.fileSize,
                    duration: selectedFilesToUpload[i]?.duration,
                  }
                : {
                    size:
                      docAttachmentType === PDF_TEXT
                        ? selectedFilesToUpload[i]?.size
                        : selectedFilesToUpload[i]?.fileSize,
                  },
            name:
              docAttachmentType === PDF_TEXT
                ? selectedFilesToUpload[i]?.name
                : selectedFilesToUpload[i]?.fileName,
            type: fileType,
            url: awsResponse,
            thumbnailUrl:
              fileType === VIDEO_TEXT ? getVideoThumbnailData?.Location : null,
          };

          const uploadRes = await myClient?.putMultimedia(payload as any);
        }
      } catch (error) {
        dispatch({
          type: SET_FILE_UPLOADING_MESSAGES,
          body: {
            message: {
              ...uploadingFilesMessages[conversationID?.toString()],
              isInProgress: FAILED,
            },
            ID: conversationID,
          },
        });
        return error;
      }
      dispatch({
        type: CLEAR_SELECTED_FILES_TO_UPLOAD,
      });
      dispatch({
        type: CLEAR_SELECTED_FILE_TO_VIEW,
      });
    }

    dispatch({
      type: CLEAR_FILE_UPLOADING_MESSAGES,
      body: {
        ID: conversationID,
      },
    });
  };

  const handleFileUpload = async (conversationID: any, isRetry: any) => {
    let selectedFilesToUpload = uploadingFilesMessages[conversationID];
    dispatch({
      type: SET_FILE_UPLOADING_MESSAGES,
      body: {
        message: {
          ...selectedFilesToUpload,
          isInProgress: SUCCESS,
        },
        ID: conversationID,
      },
    });
    const res = await uploadResource({
      selectedImages: selectedFilesToUpload?.attachments,
      conversationID: conversationID,
      chatroomID: chatroomID,
      selectedFilesToUpload: selectedFilesToUpload,
      uploadingFilesMessages,
      isRetry: isRetry,
    });
    return res;
  };

  const onReplyPrivatelyClick = async (memberID: any) => {
    const apiRes = await myClient?.checkDMLimit({
      memberId: memberID,
    });
    const res = apiRes?.data;
    if (apiRes?.success === false) {
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: `${apiRes?.error_message}`},
      });
    } else {
      let clickedChatroomID = res?.chatroom_id;
      if (!!clickedChatroomID) {
        navigation.pop(1);
        navigation.push(CHATROOM, {
          chatroomID: clickedChatroomID,
          previousChatroomID: chatroomID,
        });
      } else {
        if (res?.is_request_dm_limit_exceeded === false) {
          let payload = {
            memberId: memberID,
          };
          const apiResponse = await myClient?.createDMChatroom(payload);
          const response = apiResponse?.data;
          if (apiResponse?.success === false) {
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: `${apiResponse?.error_message}`},
            });
          } else {
            let createdChatroomID = response?.chatroom?.id;
            if (!!createdChatroomID) {
              navigation.pop(1);
              navigation.push(CHATROOM, {
                chatroomID: createdChatroomID,
              });
            }
          }
        } else {
          let userDMLimit = res?.user_dm_limit;
          Alert.alert(
            REQUEST_DM_LIMIT,
            `You can only send ${
              userDMLimit?.number_in_duration
            } DM requests per ${
              userDMLimit?.duration
            }.\n\nTry again in ${formatTime(res?.new_request_dm_timestamp)}`,
            [
              {
                text: CANCEL_BUTTON,
                style: 'default',
              },
            ],
          );
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <FlashList
        ref={flatlistRef}
        data={conversations}
        keyExtractor={(item: any, index) => {
          let isArray = Array.isArray(item);
          return isArray ? index?.toString() : item?.id?.toString();
        }}
        extraData={{
          value: [
            selectedMessages,
            uploadingFilesMessages,
            stateArr,
            conversations,
          ],
        }}
        estimatedItemSize={50}
        renderItem={({item: value, index}: any) => {
          let uploadingFilesMessagesIDArr = Object.keys(uploadingFilesMessages);
          let item = {...value};
          if (uploadingFilesMessagesIDArr.includes(value?.id?.toString())) {
            item = uploadingFilesMessages[value?.id];
          }

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
                  handleLongPress(
                    isStateIncluded,
                    isIncluded,
                    item,
                    selectedMessages,
                  );
                }}
                delayLongPress={200}
                onPress={function (event) {
                  const {pageX, pageY} = event.nativeEvent;
                  dispatch({
                    type: SET_POSITION,
                    body: {pageX: pageX, pageY: pageY},
                  });
                  handleClick(
                    isStateIncluded,
                    isIncluded,
                    item,
                    false,
                    selectedMessages,
                  );
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
                    handleClick(
                      isStateIncluded,
                      isIncluded,
                      item,
                      true,
                      selectedMessages,
                    );
                  }}
                  longPressOpenKeyboard={() => {
                    handleLongPress(
                      isStateIncluded,
                      isIncluded,
                      item,
                      selectedMessages,
                    );
                  }}
                  removeReaction={(
                    item: any,
                    reactionArr: any,
                    removeFromList?: any,
                  ) => {
                    removeReaction(item, reactionArr, removeFromList);
                  }}
                  handleTapToUndo={() => {
                    onTapToUndo();
                  }}
                  handleFileUpload={handleFileUpload}
                />
              </Pressable>
            </View>
          );
        }}
        onEndReached={async () => {
          if (shouldLoadMoreChat) {
            handleLoadMore();
          }
          return;
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        keyboardShouldPersistTaps={'handled'}
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
            //case to block normal user from messaging in a chatroom where only CMs can message
            user.state !== 1 &&
            chatroomDetails?.chatroom?.member_can_message === false ? (
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>
                  Only Community Manager can message here.
                </Text>
              </View>
            ) : //case to allow CM for messaging in an Announcement Room
            !(user.state !== 1 && chatroomDetails?.chatroom?.type === 7) &&
              chatroomFollowStatus &&
              memberRights[3]?.is_selected === true ? (
              <InputBox
                replyChatID={replyChatID}
                chatroomID={chatroomID}
                navigation={navigation}
                isUploadScreen={false}
                myRef={refInput}
                handleFileUpload={handleFileUpload}
                isEditable={isEditable}
                setIsEditable={(value: boolean) => {
                  setIsEditable(value);
                }}
                isSecret={isSecret}
              />
            ) : //case to block normal users from messaging in an Announcement Room
            user.state !== 1 && chatroomDetails?.chatroom?.type === 7 ? (
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>
                  Only Community Manager can message here.
                </Text>
              </View>
            ) : memberRights[3]?.is_selected === false ? (
              <View style={styles.disabledInput}>
                <Text style={styles.disabledInputText}>
                  The community managers have restricted you from responding
                  here.
                </Text>
              </View>
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
                    <Text style={styles.inviteBtnText}>{REJECT_BUTTON}</Text>
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
          {chatRequestState === 0 &&
          (!!chatroomDetails?.chatroom?.chat_requested_by
            ? chatroomDetails?.chatroom?.chat_requested_by[0]?.id !== user?.id
            : null) ? (
            <View style={styles.dmRequestView}>
              <Text style={styles.inviteText}>{DM_REQUEST_SENT_MESSAGE}</Text>
              <View style={styles.dmRequestButtonBox}>
                <TouchableOpacity
                  onPress={() => {
                    handleDMApproveClick();
                  }}
                  style={styles.requestMessageTextButton}>
                  <Image
                    style={styles.emoji}
                    source={require('../../assets/images/like_icon3x.png')}
                  />
                  <Text style={styles.inviteBtnText}>{APPROVE_BUTTON}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleDMRejectClick();
                  }}
                  style={styles.requestMessageTextButton}>
                  <Image
                    style={styles.emoji}
                    source={require('../../assets/images/ban_icon3x.png')}
                  />
                  <Text style={styles.inviteBtnText}>{REJECT_BUTTON}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {showDM === false ? (
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>
                {COMMUNITY_MANAGER_DISABLED_CHAT}
              </Text>
            </View>
          ) : showDM === true &&
            (chatRequestState === 0 || chatRequestState === 2) ? (
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>{REQUEST_SENT}</Text>
            </View>
          ) : (showDM === true && chatRequestState === 1) ||
            chatRequestState === null ? (
            <InputBox
              replyChatID={replyChatID}
              chatroomID={chatroomID}
              chatRequestState={chatRequestState}
              chatroomType={chatroomType}
              navigation={navigation}
              isUploadScreen={false}
              isPrivateMember={chatroomDetails?.chatroom?.is_private_member}
              myRef={refInput}
              handleFileUpload={handleFileUpload}
              isEditable={isEditable}
              setIsEditable={(value: boolean) => {
                setIsEditable(value);
              }}
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
                        showWarningModal();
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
              {isMessagePrivately ? (
                <TouchableOpacity
                  onPress={() => {
                    let memberID = selectedMessages[0]?.member?.id;

                    onReplyPrivatelyClick(memberID);
                    dispatch({type: SELECTED_MESSAGES, body: []});
                    setReportModalVisible(false);
                    // handleReportModalClose()
                  }}
                  style={styles.filtersView}>
                  <Text style={styles.filterText}>Message Privately</Text>
                </TouchableOpacity>
              ) : null}

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

      {/* CHATROOM LEAVING WARNING message modal */}
      <WarningMessageModal
        hideWarningModal={hideWarningModal}
        warningMessageModalState={isWarningMessageModalState}
        warningMessage={
          isSecret ? WARNING_MSG_PRIVATE_CHATROOM : WARNING_MSG_PUBLIC_CHATROOM
        }
        leaveChatroom={() => {
          if (isSecret) {
            leaveSecretChatroom();
          } else {
            leaveChatroom();
          }
        }}
      />

      {/* APPROVE DM request Modal */}
      <ApproveDMRequestModal
        hideDMApproveAlert={hideDMApproveAlert}
        DMApproveAlertModalVisible={DMApproveAlertModalVisible}
        onApprove={onApprove}
      />

      {/* REJECT DM request Modal */}
      <RejectDMRequestModal
        hideDMRejectAlert={hideDMRejectAlert}
        DMRejectAlertModalVisible={DMRejectAlertModalVisible}
        onReject={onReject}
        navigation={navigation}
        chatroomID={chatroomID}
        chatroomType={chatroomType}
      />

      {/* BLOCK DM request Modal */}
      <BlockDMRequestModal
        hideDMBlockAlert={hideDMBlockAlert}
        DMBlockAlertModalVisible={DMBlockAlertModalVisible}
        blockMember={blockMember}
        chatroomName={chatroomName}
      />

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
