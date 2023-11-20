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
  AppState,
  ScrollViewProps,
} from 'react-native';
import {Image as CompressedImage} from 'react-native-compressor';
import {SyncConversationRequest, myClient} from '../../..';
import {
  SHOW_LIST_REGEX,
  copySelectedMessages,
  decode,
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
  paginatedConversationsEnd,
  paginatedConversationsStart,
} from '../../store/actions/chatroom';
import {styles} from './styles';
import Clipboard from '@react-native-clipboard/clipboard';
import {DataSnapshot, onValue, ref} from 'firebase/database';
import {initAPI} from '../../store/actions/homefeed';
import {
  ACCEPT_INVITE_SUCCESS,
  ADD_STATE_MESSAGE,
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  CLEAR_CHATROOM_TOPIC,
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  CLEAR_SELECTED_MESSAGES,
  FIREBASE_CONVERSATIONS_SUCCESS,
  GET_CHATROOM_ACTIONS_SUCCESS,
  GET_CHATROOM_DB_SUCCESS,
  GET_CHATROOM_SUCCESS,
  GET_CONVERSATIONS_SUCCESS,
  LONG_PRESSED,
  REACTION_SENT,
  REJECT_INVITE_SUCCESS,
  SELECTED_MESSAGES,
  SET_CHATROOM_CREATOR,
  SET_CHATROOM_TOPIC,
  SET_DM_PAGE,
  SET_EDIT_MESSAGE,
  SET_EXPLORE_FEED_PAGE,
  SET_FILE_UPLOADING_MESSAGES,
  SET_IS_REPLY,
  SET_PAGE,
  SET_POSITION,
  SET_REPLY_MESSAGE,
  SET_TEMP_STATE_MESSAGE,
  SHOW_TOAST,
  TO_BE_DELETED,
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
  USER_SCHEMA_RO,
  VOICE_NOTE_TEXT,
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
import {useQuery} from '@realm/react';
import {Share} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import {paginatedSyncAPI} from '../../utils/syncChatroomApi';
import {
  ChatroomChatRequestState,
  DocumentType,
  GetConversationsType,
  Keys,
  MemberState,
  Sources,
} from '../../enums';
import {ChatroomType} from '../../enums';
import {onShare} from '../../shareUtils';
import {ChatroomActions, Events} from '../../enums';
import {UserSchemaResponse} from '../../db/models';
import TrackPlayer from 'react-native-track-player';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';
import {getChatroomType, getConversationType} from '../../utils/analyticsUtils';
import {GetConversationsRequest} from '@likeminds.community/chat-rn/dist/localDb/models/requestModels/GetConversationsRequest';
import {Conversation} from '@likeminds.community/chat-rn/dist/shared/responseModels/Conversation';
import {
  createTemporaryStateMessage,
  getCurrentConversation,
} from '../../utils/chatroomUtils';
import {GetConversationsRequestBuilder} from '@likeminds.community/chat-rn';

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

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

  const db = myClient?.firebaseInstance();

  const [replyChatID, setReplyChatID] = useState<number>();
  const [endPage, setEndPage] = useState(1);
  const [startPage, setStartPage] = useState(1);
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
  const [appState, setAppState] = useState(AppState.currentState);
  const [shimmerIsLoading, setShimmerIsLoading] = useState(true);
  const [shouldLoadMoreChatEnd, setShouldLoadMoreChatEnd] = useState(true);
  const [shouldLoadMoreChatStart, setShouldLoadMoreChatStart] = useState(true);
  const [lastScrollOffset, setLastScrollOffset] = useState(true);
  const [response, setResponse] = useState([]);
  const [isRealmDataPresent, setIsRealmDataPresent] = useState(false);
  const [flashListMounted, setFlashListMounted] = useState(false);

  const reactionArr = ['❤️', '😂', '😮', '😢', '😠', '👍'];
  const users = useQuery<UserSchemaResponse>(USER_SCHEMA_RO);

  const {
    chatroomID,
    isInvited,
    previousChatroomID,
    navigationFromNotification,
    updatedAt,
    deepLinking,
  } = route.params;
  const isFocused = useIsFocused();

  const dispatch = useAppDispatch();
  const {
    conversations = [],
    chatroomDetails,
    chatroomDBDetails,
    messageSent,
    isLongPress,
    selectedMessages,
    stateArr,
    position,
    chatroomCreator,
    currentChatroomTopic,
    temporaryStateMessage,
  }: any = useAppSelector(state => state.chatroom);
  const {user, community, memberRights} = useAppSelector(
    state => state.homefeed,
  );

  const {uploadingFilesMessages}: any = useAppSelector(state => state.upload);
  const {selectedVoiceNoteFilesToUpload = []}: any = useAppSelector(
    state => state.chatroom,
  );

  const INITIAL_SYNC_PAGE = 1;
  const PAGE_SIZE = 200;

  let chatroomType = chatroomDBDetails?.type;
  let chatroomFollowStatus = chatroomDBDetails?.followStatus;
  let memberCanMessage = chatroomDBDetails?.memberCanMessage;
  let chatroomWithUser = chatroomDBDetails?.chatroomWithUser;
  let chatRequestState = chatroomDBDetails?.chatRequestState;
  const [isChatroomTopic, setIsChatroomTopic] = useState(false);
  const [isFound, setIsFound] = useState(false);

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
    chatroomType === ChatroomType.DMCHATROOM
      ? user?.id != chatroomWithUser?.id
        ? chatroomWithUser?.name
        : chatroomDBDetails?.member?.name!
      : chatroomDBDetails?.header;

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
    chatroomType === ChatroomType.DMCHATROOM
      ? user?.id !== chatroomWithUser?.id
        ? chatroomWithUser?.imageUrl
        : chatroomDBDetails?.member?.imageUrl!
      : null;

  let routes = navigation.getState()?.routes;

  let previousRoute = routes[routes?.length - 2];

  let isSecret = chatroomDBDetails?.isSecret;

  let notIncludedActionsID = [16]; // Add All members
  let filteredChatroomActions = chatroomDetails?.chatroomActions?.filter(
    (val: any) => !notIncludedActionsID?.includes(val?.id),
  );

  // This method is to call setChatroomTopic API and update local db as well followed by updation of redux for local handling
  const setChatroomTopic = async () => {
    const currentSelectedMessage = selectedMessages[0];
    const payload = {
      chatroomId: chatroomID,
      conversationId: currentSelectedMessage?.id,
    };
    const response = await myClient?.setChatroomTopic(
      payload,
      currentSelectedMessage,
    );
    if (response?.success === true) {
      dispatch({
        type: SET_CHATROOM_TOPIC,
        body: {currentChatroomTopic: currentSelectedMessage},
      });
      dispatch({
        type: CLEAR_SELECTED_MESSAGES,
      });
    }
  };

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
                body: {chatroomDBDetails: {}},
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
          {!(Object.keys(chatroomDBDetails)?.length === 0) ? (
            <View style={styles.alignRow}>
              {chatroomType === ChatroomType.DMCHATROOM ? (
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
                {chatroomType !== ChatroomType.DMCHATROOM ? (
                  <Text
                    style={{
                      color: STYLES.$COLORS.MSG,
                      fontSize: STYLES.$FONT_SIZES.SMALL,
                      fontFamily: STYLES.$FONT_TYPES.LIGHT,
                    }}>
                    {chatroomDetails?.participantCount != undefined
                      ? `${chatroomDetails?.participantCount} participants`
                      : ''}
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
              {selectedMessages?.length}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => {
        let len = selectedMessages?.length;
        let communityManagerState = 1;
        let userCanDeleteParticularMessageArr: any = [];
        let selectedMessagesIDArr: any = [];
        let isCopy = false;
        let showCopyIcon = true;
        let isDelete = false;
        let isFirstMessageDeleted = selectedMessages[0]?.deletedBy;
        let isSelectedMessageEditable = false;
        let selectedMessagesLength = selectedMessages?.length;

        //Logic to set isSelectedMessageEditable true/false, based on that we will show edit icon.
        if (selectedMessagesLength === 1) {
          if (
            selectedMessages[0]?.member?.id == user?.id &&
            !!selectedMessages[0]?.answer &&
            selectedMessages[0]?.deletedBy == null
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
          if (selectedMessages[i]?.attachmentCount > 0) {
            showCopyIcon = false;
          }

          if (!!!selectedMessages[i]?.deletedBy && showCopyIcon) {
            isCopy = true;
          } else if (!showCopyIcon) {
            isCopy = false;
          }

          if (
            selectedMessages[i]?.member?.id == user?.id &&
            !!!selectedMessages[i]?.deletedBy
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
            userCanDeleteParticularMessageArr?.length === 1 &&
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
                      LMChatAnalytics.track(
                        Events.MESSAGE_REPLY,
                        new Map<string, string>([
                          [Keys.TYPE, getConversationType(selectedMessages[0])],
                          [Keys.CHATROOM_ID, chatroomID?.toString()],
                          [
                            Keys.REPLIED_TO_MEMBER_ID,
                            selectedMessages[0]?.member?.id,
                          ],
                          [
                            Keys.REPLIED_TO_MEMBER_STATE,
                            selectedMessages[0]?.member?.state,
                          ],
                          [Keys.REPLIED_TO_MESSAGE_ID, selectedMessages[0]?.id],
                        ]),
                      );
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
                  const output = copySelectedMessages(
                    selectedMessages,
                    chatroomID,
                  );
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
                  const output = copySelectedMessages(
                    selectedMessages,
                    chatroomID,
                  );
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
            (chatroomType === ChatroomType.DMCHATROOM
              ? !!chatRequestState
              : true) ? ( // this condition checks in case of DM, chatRequestState != 0 && chatRequestState != null then only show edit Icon
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
                    .deleteConversations({
                      conversationIds: selectedMessagesIDArr,
                      reason: 'none',
                    })
                    .then(async () => {
                      dispatch({type: SELECTED_MESSAGES, body: []});
                      dispatch({type: LONG_PRESSED, body: false});
                      let updatedConversations;
                      for (let i = 0; i < selectedMessagesIDArr.length; i++) {
                        LMChatAnalytics.track(
                          Events.MESSAGE_DELETED,
                          new Map<string, string>([
                            [
                              Keys.TYPE,
                              getConversationType(selectedMessages[i]),
                            ],
                            [Keys.CHATROOM_ID, chatroomID?.toString()],
                          ]),
                        );
                        if (
                          selectedMessagesIDArr[i] == currentChatroomTopic?.id
                        ) {
                          dispatch({
                            type: CLEAR_CHATROOM_TOPIC,
                          });
                          updatedConversations =
                            await myClient?.deleteConversation(
                              selectedMessagesIDArr[i],
                              user,
                              conversations,
                              true,
                              chatroomID?.toString(),
                            );
                        } else {
                          updatedConversations =
                            await myClient?.deleteConversation(
                              selectedMessagesIDArr[i],
                              user,
                              conversations,
                              false,
                              chatroomID?.toString(),
                            );
                        }
                        // to stop audio player if we delete the message
                        const conversation: any =
                          await myClient.getConversation(
                            selectedMessagesIDArr[i],
                          );
                        if (
                          conversation[0]?.attachments[0]?.type ==
                          VOICE_NOTE_TEXT
                        ) {
                          await TrackPlayer.reset();
                        }
                      }
                      dispatch({
                        type: GET_CONVERSATIONS_SUCCESS,
                        body: {conversations: updatedConversations},
                      });
                      setInitialHeader();
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
    if (chatroomType === ChatroomType.DMCHATROOM) {
      dispatch({type: SET_DM_PAGE, body: 1});
    } else {
      dispatch({type: SET_PAGE, body: 1});
    }
  };

  // Sync conversation API call
  async function syncConversationAPI(
    page: number,
    maxTimeStamp: number,
    minTimeStamp: number,
    conversationId?: string,
  ) {
    const res = myClient?.syncConversation(
      SyncConversationRequest.builder()
        .setChatroomId(chatroomID)
        .setPage(page)
        .setMinTimestamp(minTimeStamp)
        .setMaxTimestamp(maxTimeStamp)
        .setPageSize(500)
        .setConversationId(conversationId)
        .build(),
    );
    return res;
  }

  // pagination call for sync conversation
  const paginatedConversationSyncAPI = async (
    page: number,
    minTimeStamp: number,
    maxTimeStamp: number,
    conversationId?: string,
  ) => {
    const val = await syncConversationAPI(
      page,
      maxTimeStamp,
      minTimeStamp,
      conversationId,
    );

    const DB_RESPONSE = val?.data;

    if (DB_RESPONSE?.conversationsData.length !== 0) {
      // This is to get chatroomCreator of current chatroom which will be later used to give permission that who can set chatroom topic
      const chatroomCreatorUserId =
        DB_RESPONSE?.chatroomMeta[chatroomID]?.userId;
      const chatroomCreator = DB_RESPONSE?.userMeta[chatroomCreatorUserId];

      dispatch({
        type: SET_CHATROOM_CREATOR,
        body: {chatroomCreator: chatroomCreator},
      });
      await myClient?.saveConversationData(
        DB_RESPONSE,
        DB_RESPONSE?.chatroomMeta,
        DB_RESPONSE?.conversationsData,
        user?.sdkClientInfo?.community?.toString(),
      );
    }

    if (page === 1) {
      const payload = GetConversationsRequestBuilder.builder()
        .setChatroomId(chatroomID?.toString())
        .setLimit(PAGE_SIZE)
        .build();

      let conversationsFromRealm = await myClient?.getConversations(payload);

      dispatch({
        type: GET_CONVERSATIONS_SUCCESS,
        body: {conversations: conversationsFromRealm},
      });
    }

    if (DB_RESPONSE?.conversationsData?.length === 0) {
      return;
    } else {
      paginatedConversationSyncAPI(
        page + 1,
        minTimeStamp,
        maxTimeStamp,
        conversationId,
      );
    }
  };

  // this function fetchConversations when we first move inside Chatroom
  async function fetchData(chatroomDetails: any, showLoaderVal?: boolean) {
    let maxTimeStamp = Math.floor(Date.now() * 1000);

    if (chatroomDetails === undefined) {
      //Cold start in case of initiating on a new DM or viewing chatroom from ExploreFeed
      await paginatedConversationSyncAPI(INITIAL_SYNC_PAGE, 0, maxTimeStamp);
      await myClient?.updateChatroomViewed(chatroomID);
      setShimmerIsLoading(false);
      fetchChatroomDetails();
    } else {
      let conversationsFromRealm;

      // Warm start
      if (chatroomDetails?.isChatroomVisited) {
        const payload = GetConversationsRequestBuilder.builder()
          .setChatroomId(chatroomID?.toString())
          .setLimit(PAGE_SIZE)
          .build();

        conversationsFromRealm = await myClient?.getConversations(payload);

        dispatch({
          type: GET_CONVERSATIONS_SUCCESS,
          body: {conversations: conversationsFromRealm},
        });
        let minTimeStamp =
          chatroomDetails?.lastSeenConversation?.lastUpdatedAt ?? 0;
        await paginatedConversationSyncAPI(
          INITIAL_SYNC_PAGE,
          minTimeStamp,
          maxTimeStamp,
        );
      } else {
        // Cold start
        await paginatedConversationSyncAPI(INITIAL_SYNC_PAGE, 0, maxTimeStamp);
        await myClient?.updateChatroomViewed(chatroomID);
        setShimmerIsLoading(false);
      }
    }
  }

  //this function fetchChatroomDetails when we first move inside Chatroom
  async function fetchChatroomDetails() {
    let payload = {chatroomId: chatroomID};
    let DB_DATA = await myClient?.getChatroom(chatroomID?.toString());
    if (DB_DATA?.isChatroomVisited) {
      setShimmerIsLoading(false);
    }
    if (DB_DATA) {
      dispatch({
        type: GET_CHATROOM_DB_SUCCESS,
        body: {chatroomDBDetails: DB_DATA},
      });
      setIsRealmDataPresent(true);
      // This is to set chatroom topic if its already in API response
      if (DB_DATA?.topic && DB_DATA?.topicId) {
        dispatch({
          type: SET_CHATROOM_TOPIC,
          body: {
            currentChatroomTopic: DB_DATA?.topic,
          },
        });
      } else if (!DB_DATA?.topic && !DB_DATA?.topicId) {
        dispatch({
          type: CLEAR_CHATROOM_TOPIC,
        });
      }
    }
    let response = await myClient?.getChatroomActions(payload);
    dispatch({
      type: GET_CHATROOM_ACTIONS_SUCCESS,
      body: response?.data,
    });
    return DB_DATA;
  }

  // this function fetch initiate API
  async function fetchInitAPI() {
    //this line of code is for the sample app only, pass your uuid instead of this.
    const UUID = users[0]?.userUniqueID;
    const userName = users[0]?.userName;

    let payload = {
      uuid: UUID,
      userName: userName,
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
      body: {chatroomDBDetails: {}},
    });
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    dispatch({type: SET_IS_REPLY, body: {isReply: false}});
    dispatch({
      type: SET_REPLY_MESSAGE,
      body: {replyMessage: ''},
    });
  }, []);

  // This useEffect is used to highlight the chatroom topic conversation for 1 sec on scrolling to it
  useEffect(() => {
    if (isFound) {
      setTimeout(() => {
        setIsFound(false);
      }, 1000);
    }
  }, [isFound]);

  // local handling for chatroom topic updation's state message
  useEffect(() => {
    const addChatroomTopic = async () => {
      const tempStateMessage = createTemporaryStateMessage(
        currentChatroomTopic,
        user,
      );
      dispatch({
        type: ADD_STATE_MESSAGE,
        body: {conversation: tempStateMessage},
      });
      dispatch({
        type: SET_TEMP_STATE_MESSAGE,
        body: {temporaryStateMessage: tempStateMessage},
      });
      await myClient?.saveNewConversation(
        chatroomID?.toString(),
        tempStateMessage,
      );
    };
    if (selectedMessages.length !== 0) {
      addChatroomTopic();
    }
  }, [currentChatroomTopic]);

  // To trigger analytics for Message Selected
  useEffect(() => {
    for (let i = 0; i < selectedMessages.length; i++) {
      LMChatAnalytics.track(
        Events.MESSAGE_SELECTED,
        new Map<string, string>([
          [Keys.TYPE, getConversationType(selectedMessages[i])],
          [Keys.CHATROOM_ID, chatroomID?.toString()],
        ]),
      );
    }
  }, [selectedMessages]);

  // To trigger analytics for Chatroom opened
  useEffect(() => {
    let source;
    if (previousRoute?.name === EXPLORE_FEED) {
      source = 'explore_feed';
    } else if (previousRoute?.name === HOMEFEED) {
      source = 'home_feed';
    } else if (navigationFromNotification) {
      source = 'notification';
    } else if (deepLinking) {
      source = 'deep_link';
    }
    LMChatAnalytics.track(
      Events.CHAT_ROOM_OPENED,
      new Map<string, string>([
        [Keys.CHATROOM_ID, chatroomID?.toString()],
        [
          Keys.CHATROOM_TYPE,
          getChatroomType(chatroomType, chatroomDBDetails?.isSecret),
        ],
        [Keys.SOURCE, source],
      ]),
    );
  }, [chatroomType]);

  //this useEffect fetch chatroom details only after initiate API got fetched if `navigation from Notification` else fetch chatroom details
  useEffect(() => {
    const invokeFunction = async () => {
      if (navigationFromNotification) {
        if (appState.match(/active|foreground/)) {
          // App has gone to the background
          await fetchInitAPI();
        }
        const chatroomDetails = await fetchChatroomDetails();
        await fetchData(chatroomDetails, false);
      } else {
        const chatroomDetails = await fetchChatroomDetails();
        await fetchData(chatroomDetails, false);
      }
    };
    invokeFunction();
  }, [navigation, user]);

  // this useEffect set unseenCount to zero when closing the chatroom
  useEffect(() => {
    const closingChatroom = async () => {
      await myClient?.markReadChatroom({
        chatroomId: chatroomID,
      });
      await myClient?.updateUnseenCount(chatroomID?.toString());
      await myClient?.deleteConversationFromRealm(temporaryStateMessage?.id);
    };
    return () => {
      if (previousRoute?.name !== EXPLORE_FEED) {
        closingChatroom();
      }
    };
  }, [temporaryStateMessage]);

  // this useEffect is to stop audio player when going out of chatroom, if any audio is running
  useEffect(() => {
    return () => {
      TrackPlayer.reset();
    };
  }, []);

  // this useEffect is to stop audio player when the app is in background
  useEffect(() => {
    if (!isFocused) {
      TrackPlayer.reset();
    }
  }, [isFocused]);

  //Logic for navigation backAction
  function backAction() {
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    if (chatroomType === ChatroomType.DMCHATROOM) {
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
      if (chatroomType === ChatroomType.DMCHATROOM) {
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
  }, [chatroomDBDetails, chatroomDetails]);

  // this useEffect call API to show InputBox based on showDM key.
  useEffect(() => {
    async function callApi() {
      if (chatroomType == ChatroomType.DMCHATROOM) {
        let apiRes = await myClient?.canDmFeed({
          reqFrom: 'chatroom',
          chatroomId: chatroomID,
          uuid: chatroomWithUser?.sdkClientInfo?.uuid,
        });
        let response = apiRes?.data;
        if (!!response?.cta) {
          setShowDM(response?.showDm);
        }
      } else if (
        chatroomType == ChatroomType.OPENCHATROOM ||
        chatroomType == ChatroomType.ANNOUNCEMENTROOM
      ) {
        if (!!community?.id) {
          let payload = {
            page: 1,
          };
        }
      }
    }

    if (!!chatroomDBDetails) {
      callApi();
    }
  }, [chatroomDBDetails]);

  // this useEffect scroll to Index of latest message when we send the message.
  useEffect(() => {
    if (conversations?.length > 0) {
      flatlistRef?.current?.scrollToIndex({
        animated: false,
        index: 0,
      });
    }
  }, [messageSent]);
  // this useEffect update headers when we longPress or update selectedMessages array.
  useEffect(() => {
    if (selectedMessages?.length === 0) {
      setInitialHeader();
    } else if (!!isLongPress) {
      setSelectedHeader();
    }
  }, [isLongPress, selectedMessages]);

  // sync conversation call with conversation_id from firebase listener
  const firebaseConversationSyncAPI = async (
    page: number,
    minTimeStamp: number,
    maxTimeStamp: number,
    conversationId?: string,
  ) => {
    const val = await syncConversationAPI(
      page,
      maxTimeStamp,
      minTimeStamp,
      conversationId,
    );
    const DB_RESPONSE = val?.data;
    if (DB_RESPONSE?.conversationsData?.length !== 0) {
      await myClient?.saveConversationData(
        DB_RESPONSE,
        DB_RESPONSE?.chatroomMeta,
        DB_RESPONSE?.conversationsData,
        community?.id,
      );
    }
    if (page === 1) {
      const payload = GetConversationsRequestBuilder.builder()
        .setChatroomId(chatroomID?.toString())
        .setLimit(PAGE_SIZE)
        .build();
      let conversationsFromRealm = await myClient?.getConversations(payload);
      dispatch({
        type: GET_CONVERSATIONS_SUCCESS,
        body: {conversations: conversationsFromRealm},
      });
    }
    return;
  };

  //useffect includes firebase realtime listener
  useEffect(() => {
    const query = ref(db, `/collabcards/${chatroomID}`);
    return onValue(query, async (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        let firebaseData = snapshot.val();
        let conversationID = firebaseData?.collabcard?.answer_id;
        if (conversationID) {
          if (!user?.sdkClientInfo?.community) return;
          let maxTimeStamp = Math.floor(Date.now() * 1000);
          await firebaseConversationSyncAPI(
            INITIAL_SYNC_PAGE,
            0,
            maxTimeStamp,
            conversationID,
          );
          await myClient?.updateChatRequestState(
            chatroomID?.toString(),
            ChatroomChatRequestState.ACCEPTED,
          );
          fetchChatroomDetails();
        }
      }
    });
  }, []);

  // this useffect updates routes, previousRoute variables when we come to chatroom.
  useEffect(() => {
    if (isFocused) {
      routes = navigation.getState()?.routes;
      previousRoute = routes[routes?.length - 2];
    }
  }, [isFocused]);

  //This useEffect has logic to or hide message privately when long press on a message
  useEffect(() => {
    if (selectedMessages?.length === 1) {
      let selectedMessagesMember = selectedMessages[0]?.member;
      if (
        showDM &&
        selectedMessagesMember?.id !== user?.id &&
        !selectedMessages[0]?.deletedBy
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

  // This is to check eligibity of user that whether he/she can set chatroom topic or not
  useEffect(() => {
    let selectedMessagesLength = selectedMessages.length;
    let selectedMessage = selectedMessages[0];

    if (
      selectedMessagesLength == 1 &&
      (user?.sdkClientInfo?.uuid == chatroomCreator?.sdkClientInfo?.uuid ||
        user?.state == MemberState.ADMIN) &&
      selectedMessage?.deletedBy == null
    ) {
      setIsChatroomTopic(true);
    }
  }, [selectedMessages]);

  //function calls paginatedConversations action which internally calls getConversation to update conversation array with the new data.
  async function paginatedData(newPage: number) {
    let payload = {
      chatroomID: chatroomID,
      conversationID: conversations[conversations?.length - 1]?.id,
      scrollDirection: 0,
      paginateBy: 50,
      topNavigate: false,
    };
    let response = await dispatch(paginatedConversations(payload, true) as any);
    return response;
  }

  // function shows loader in between calling the API and getting the response
  const loadData = async (newPage?: number) => {
    setIsLoading(true);
    const payload = GetConversationsRequestBuilder.builder()
      .setChatroomId(chatroomID?.toString())
      .setLimit(PAGE_SIZE)
      .setMedianConversation(conversations[conversations.length - 1])
      .build();
    const newConversations = await myClient.getConversations(payload);
    dispatch({
      type: GET_CONVERSATIONS_SUCCESS,
      body: {conversations: [...conversations, ...newConversations]},
    });
    if (newConversations.length == 0) {
      setShouldLoadMoreChatEnd(false);
    }
    if (!!newConversations) {
      setIsLoading(false);
    }
  };

  // function shows loader in between calling the API and getting the response
  const loadStartData = async (newPage?: number) => {
    setIsLoading(true);
    const payload = GetConversationsRequestBuilder.builder()
      .setChatroomId(chatroomID?.toString())
      .setLimit(PAGE_SIZE)
      .setMedianConversation(conversations[0])
      .setType(GetConversationsType.BELOW)
      .build();

    let newConversations = await myClient.getConversations(payload);
    newConversations = newConversations.reverse();
    dispatch({
      type: GET_CONVERSATIONS_SUCCESS,
      body: {conversations: [...newConversations, ...conversations]},
    });

    if (newConversations.length !== 0 && !isFound) {
      const length = newConversations.length;
      let index = length;
      if (
        conversations[index + 1].attachmentCount == 0 &&
        conversations[index + 1].polls == undefined
      ) {
        index = length - 2;
      } else if (length < PAGE_SIZE) {
        index = length;
      } else {
        index = length + 8;
      }
      scrollToVisibleIndex(index);
    }
    if (newConversations.length == 0) {
      setShouldLoadMoreChatStart(false);
    }
    if (!!newConversations) {
      setIsLoading(false);
    }
  };

  //function checks the pagination logic, if it verifies the condition then call loadData
  const handleLoadMore = () => {
    loadData();
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
      uuid: user?.sdkClientInfo?.uuid,
      value: false,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        LMChatAnalytics.track(
          Events.CHAT_ROOM_UN_FOLLOWED,
          new Map<string, string>([
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [Keys.COMMUNITY_ID, user?.sdkClientInfo?.community?.toString()],
            [Keys.SOURCE, Sources.COMMUNITY_FEED],
          ]),
        );
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            orderType: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
          dispatch({
            type: CLEAR_CHATROOM_CONVERSATION,
            body: {conversations: []},
          });
          dispatch({
            type: CLEAR_CHATROOM_DETAILS,
            body: {chatroomDBDetails: {}},
          });
          await myClient?.updateChatroomFollowStatus(
            chatroomID?.toString(),
            false,
          );
          navigation.goBack();
        } else {
          // Updating the followStatus of chatroom to false in case of leaving the chatroom
          await myClient?.updateChatroomFollowStatus(
            chatroomID?.toString(),
            false,
          );
          setTimeout(() => {
            navigation.goBack();
          }, 300);
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
        LMChatAnalytics.track(
          Events.CHAT_ROOM_LEFT,
          new Map<string, string>([
            [Keys.CHATROOM_NAME, chatroomName?.toString()],
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [
              Keys.CHATROOM_TYPE,
              getChatroomType(chatroomType, chatroomDBDetails?.isSecret),
            ],
          ]),
        );
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            orderType: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
          dispatch({
            type: CLEAR_CHATROOM_CONVERSATION,
            body: {conversations: []},
          });
          dispatch({
            type: CLEAR_CHATROOM_DETAILS,
            body: {chatroomDBDetails: {}},
          });
          await myClient?.updateChatroomFollowStatus(
            chatroomID?.toString(),
            false,
          );
          navigation.goBack();
        } else {
          // Updating the followStatus of chatroom to false in case of leaving the chatroom
          await myClient?.updateChatroomFollowStatus(
            chatroomID?.toString(),
            false,
          );
          setTimeout(() => {
            navigation.goBack();
          }, 300);
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
      uuid: user?.sdkClientInfo?.uuid,
      value: true,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        LMChatAnalytics.track(
          Events.CHAT_ROOM_FOLLOWED,
          new Map<string, string>([
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [Keys.COMMUNITY_ID, user?.sdkClientInfo?.community?.toString()],
            [Keys.SOURCE, Sources.COMMUNITY_FEED],
          ]),
        );
        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            orderType: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
        } else {
          updatePageInRedux();
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
      uuid: user?.sdkClientInfo?.uuid,
      value: true,
    };
    const res = await myClient
      .followChatroom(payload)
      .then(async () => {
        await paginatedConversationSyncAPI(
          INITIAL_SYNC_PAGE,
          0,
          Date.now() * 1000,
        );

        await myClient?.updateChatroomFollowStatus(
          chatroomID?.toString(),
          true,
        );
        fetchChatroomDetails();

        LMChatAnalytics.track(
          Events.CHAT_ROOM_FOLLOWED,
          new Map<string, string>([
            [Keys.CHATROOM_ID, chatroomID?.toString()],
            [Keys.COMMUNITY_ID, user?.sdkClientInfo?.community?.toString()],
            [Keys.SOURCE, Sources.COMMUNITY_FEED],
          ]),
        );

        if (previousRoute?.name === EXPLORE_FEED) {
          dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
          let payload2 = {
            orderType: 0,
            page: 1,
          };
          await dispatch(getExploreFeedData(payload2, true) as any);
          updatePageInRedux();
        } else {
          updatePageInRedux();
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
        myClient?.updateMuteStatus(chatroomID);
        LMChatAnalytics.track(
          Events.CHATROOM_MUTED,
          new Map<string, string>([[Keys.CHATROOM_NAME, chatroomName]]),
        );
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
        myClient?.updateMuteStatus(chatroomID);
        LMChatAnalytics.track(
          Events.CHATROOM_UNMUTED,
          new Map<string, string>([[Keys.CHATROOM_NAME, chatroomName]]),
        );
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
              body: {chatroomDBDetails: {}},
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
  const sendReactionAPI = async (
    consversationID: any,
    reaction: any,
    isReactionButton: boolean,
  ) => {
    const res = await myClient?.putReaction({
      conversationId: consversationID,
      reaction: reaction,
    });
    let from;
    if (isReactionButton) {
      from = 'reaction button';
    } else {
      from = 'long press';
    }
    LMChatAnalytics.track(
      Events.REACTION_ADDED,
      new Map<string, string>([
        [Keys.REACTION, reaction],
        [Keys.FROM, from],
        [Keys.MESSAGE_ID, consversationID?.toString()],
        [Keys.CHATROOM_ID, chatroomID?.toString()],
      ]),
    );
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
  const sendReaction = (val: any, isReactionButton: boolean) => {
    let previousMsg = selectedMessages[0];
    let changedMsg;
    if (selectedMessages[0]?.reactions?.length > 0) {
      let isReactedArr = selectedMessages[0]?.reactions.filter(
        (val: any) => val?.member?.id == user?.id,
      );
      if (isReactedArr?.length > 0) {
        // Reacted different emoji
        if (isReactedArr[0].reaction !== val) {
          const resultArr = selectedMessages[0]?.reactions.map((element: any) =>
            element?.member?.id == user?.id
              ? {
                  member: {
                    id: user?.id,
                    name: user?.name,
                    imageUrl: '',
                  },
                  reaction: val,
                  updatedAt: Date.now(),
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
            element?.member?.id == user?.id
              ? {
                  member: {
                    id: user?.id,
                    name: user?.name,
                    imageUrl: '',
                  },
                  reaction: val,
                  updatedAt: Date.now(),
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
                imageUrl: '',
              },
              reaction: val,
              updatedAt: Date.now(),
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
              imageUrl: '',
            },
            reaction: val,
            updatedAt: Date.now(),
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
    sendReactionAPI(previousMsg?.id, val, isReactionButton);
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
        (val: any) => val?.member?.id == user?.id,
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
    sendReaction(emojiObject?.emoji, true);
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
        if (filterdMessages?.length > 0) {
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
        if (filterdMessages?.length > 0) {
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
      chatRequestState: ChatroomChatRequestState.ACCEPTED,
    });

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: {chatRequestState: 1},
    });

    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.ACCEPTED,
    );
    fetchChatroomDetails();

    dispatch({
      type: ADD_STATE_MESSAGE,
      body: {conversation: response?.data?.conversation},
    });
    await myClient?.saveNewConversation(
      chatroomID?.toString(),
      response?.data?.conversation,
    );
  };

  // this function calls API to reject DM request
  const onReject = async () => {
    let response = await myClient?.sendDMRequest({
      chatroomId: chatroomID,
      chatRequestState: ChatroomChatRequestState.REJECTED,
    });

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: {chatRequestState: 2},
    });
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: {conversation: response?.data?.conversation},
    });

    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.REJECTED,
    );
    fetchChatroomDetails();
  };

  // this function calls API to approve DM request on click TapToUndo
  const onTapToUndo = async () => {
    let response = await myClient?.blockMember({
      chatroomId: chatroomID,
      status: ChatroomChatRequestState.ACCEPTED,
    });

    //dispatching redux action for local handling of chatRequestState
    dispatch({
      type: UPDATE_CHAT_REQUEST_STATE,
      body: {chatRequestState: 1},
    });
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: {conversation: response?.data?.conversation},
    });
    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.ACCEPTED,
    );
    fetchChatroomDetails();
  };

  // this function calls API to block a member
  const blockMember = async () => {
    let payload = {
      chatroomId: chatroomID,
      status: ChatroomChatRequestState.INITIATED,
    };
    const response = await myClient?.blockMember(payload);
    dispatch({
      type: SHOW_TOAST,
      body: {isToast: true, msg: 'Member blocked'},
    });
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: {conversation: response?.data?.conversation},
    });
    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.REJECTED,
    );
    fetchChatroomDetails();
  };

  // this function calls API to unblock a member
  const unblockMember = async () => {
    let payload = {
      chatroomId: chatroomID,
      status: ChatroomChatRequestState.ACCEPTED,
    };
    const response = await myClient?.blockMember(payload);
    dispatch({
      type: SHOW_TOAST,
      body: {isToast: true, msg: 'Member blocked'},
    });
    dispatch({
      type: ADD_STATE_MESSAGE,
      body: {conversation: response?.data?.conversation},
    });
    await myClient?.updateChatRequestState(
      chatroomID?.toString(),
      ChatroomChatRequestState.ACCEPTED,
    );
    fetchChatroomDetails();
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
      let voiceNoteAttachmentType = item?.type;
      let thumbnailURL = item?.thumbnailUrl;
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

      let uriFinal: any;

      if (attachmentType === IMAGE_TEXT) {
        //image compression
        const compressedImgURI = await CompressedImage.compress(item.uri, {
          compressionMethod: 'auto',
        });
        const compressedImg = await fetchResourceFromURI(compressedImgURI);
        uriFinal = compressedImg;
      } else {
        const img = await fetchResourceFromURI(item.uri);
        uriFinal = img;
      }

      //for video thumbnail
      let thumbnailUrlImg = null;
      if (thumbnailURL && attachmentType === VIDEO_TEXT) {
        thumbnailUrlImg = await fetchResourceFromURI(thumbnailURL);
      }

      const params = {
        Bucket: BUCKET,
        Key: path,
        Body: uriFinal,
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
          } else if (voiceNoteAttachmentType === VOICE_NOTE_TEXT) {
            fileType = VOICE_NOTE_TEXT;
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
                : fileType === VOICE_NOTE_TEXT
                ? {
                    size: null,
                    duration: item?.duration,
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
                : voiceNoteAttachmentType === VOICE_NOTE_TEXT
                ? item?.name
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
        let id = conversationID;
        let message = {
          ...uploadingFilesMessages[conversationID?.toString()],
          isInProgress: FAILED,
        };

        await myClient?.saveAttachmentUploadConversation(
          id?.toString(),
          JSON.stringify(message),
        );
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
    await myClient?.removeAttactmentUploadConversationByKey(
      conversationID?.toString(),
    );
  };

  const handleFileUpload = async (
    conversationID: number,
    isRetry: boolean,
    isVoiceNote?: boolean,
    voiceNotesToUpload?: any,
  ) => {
    if (isVoiceNote) {
      const res = await uploadResource({
        selectedImages: voiceNotesToUpload,
        conversationID: conversationID,
        chatroomID: chatroomID,
        selectedFilesToUpload: voiceNotesToUpload,
        uploadingFilesMessages,
        isRetry: isRetry,
      });

      LMChatAnalytics.track(
        Events.VOICE_NOTE_SENT,
        new Map<string, string>([
          [Keys.CHATROOM_TYPE, chatroomType?.toString()],
          [Keys.CHATROOM_ID, chatroomID?.toString()],
        ]),
      );

      return res;
    } else {
      LMChatAnalytics.track(
        Events.ATTACHMENT_UPLOAD_ERROR,
        new Map<string, string>([
          [Keys.CHATROOM_ID, chatroomID?.toString()],
          [Keys.CHATROOM_TYPE, chatroomDBDetails?.type?.toString()],
          [Keys.CLICKED_RETRY, true],
        ]),
      );
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
      let id = conversationID;
      let message = {
        ...selectedFilesToUpload,
        isInProgress: SUCCESS,
      };

      await myClient?.saveAttachmentUploadConversation(
        id.toString(),
        JSON.stringify(message),
      );
      const res = await uploadResource({
        selectedImages: selectedFilesToUpload?.attachments,
        conversationID: conversationID,
        chatroomID: chatroomID,
        selectedFilesToUpload: selectedFilesToUpload,
        uploadingFilesMessages,
        isRetry: isRetry,
      });
      return res;
    }
  };

  const onReplyPrivatelyClick = async (uuid: any, conversationId: string) => {
    const apiRes = await myClient?.checkDMLimit({
      uuid: uuid,
    });
    const res = apiRes?.data;
    if (apiRes?.success === false) {
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: `${apiRes?.errorMessage}`},
      });
    } else {
      let clickedChatroomID = res?.chatroomId;
      if (!!clickedChatroomID) {
        navigation.pop(1);
        navigation.push(CHATROOM, {
          chatroomID: clickedChatroomID,
          previousChatroomID: chatroomID,
        });
      } else {
        if (res?.isRequestDmLimitExceeded === false) {
          let payload = {
            uuid: uuid,
          };
          const apiResponse = await myClient?.createDMChatroom(payload);
          setShimmerIsLoading(false);
          const response = apiResponse?.data;
          if (apiResponse?.success === false) {
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: `${apiResponse?.errorMessage}`},
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
          let userDMLimit = res?.userDmLimit;
          Alert.alert(
            REQUEST_DM_LIMIT,
            `You can only send ${
              userDMLimit?.numberInDuration
            } DM requests per ${
              userDMLimit?.duration
            }.\n\nTry again in ${formatTime(res?.newRequestDmTimestamp)}`,
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
    LMChatAnalytics.track(
      Events.REPLY_PRIVATELY,
      new Map<string, string>([
        [Keys.CHATROOM_ID, chatroomID?.toString()],
        [Keys.MESSAGE_ID, conversationId?.toString()],
        [Keys.SENDER_ID, user?.sdkClientInfo?.uuid?.toString()],
        [Keys.RECEIVER_ID, uuid?.toString()],
      ]),
    );
  };

  // Function calls paginatedConversationsEnd action which internally calls getConversations to update conversation array with the new data.
  async function endOfPaginatedData() {
    let payload = {
      chatroomID: chatroomID,
      conversationID: conversations[conversations?.length - 1]?.id,
      scrollDirection: 0, //scroll up -> 0
      paginateBy: 50,
      topNavigate: false,
    };
    let response = await dispatch(
      paginatedConversationsEnd(payload, true) as any,
    );
    return response;
  }

  // Function shows loader in between calling the API and getting the response
  const endLoadData = async () => {
    setIsLoading(true);
    const res = await endOfPaginatedData();

    // To check if its the end of list (top of list in our case)
    if (res?.conversations?.length == 0) {
      setShouldLoadMoreChatEnd(false);
    }

    if (!!res) {
      setIsLoading(false);
    }
  };

  // Function checks the pagination logic, if it verifies the condition then call endLoadData
  const handleOnEndReached = () => {
    if (!isLoading && conversations?.length > 0) {
      // checking if conversations length is greater the 15 as it convered all the screen sizes of mobiles, and pagination API will never call if screen is not full messages.
      if (conversations?.length > 15) {
        const newPage = endPage + 1;
        setEndPage(newPage);
        endLoadData();
      }
    }
  };

  // Function calls paginatedConversationsStart action which internally calls getConversations to update conversation array with the new data.
  async function startOfPaginatedData() {
    let payload = {
      chatroomID: chatroomID,
      conversationID: conversations[0]?.id,
      scrollDirection: 1, //scroll down -> 1
      paginateBy: 50,
      topNavigate: false,
    };
    let response = await dispatch(
      paginatedConversationsStart(payload, true) as any,
    );
    return response;
  }

  // This is for scrolling down mainly ie whenever response changes this useEffect will be triggered and it'll calculate the index of the last message before prepending of new data and scroll to that index
  useEffect(() => {
    setTimeout(() => {
      if (!!response) {
        const len = response?.conversations?.length;
        if (len != 0 && len != undefined) {
          let index = len;
          if (
            conversations[index + 1].attachmentCount == 0 &&
            conversations[index + 1].polls == undefined
          ) {
            index = len - 2;
          }
          scrollToVisibleIndex(index);
        }
        setIsLoading(false);
      }
    }, 1500);
  }, [response]);

  const scrollToVisibleIndex = (index: number) => {
    if (flatlistRef.current) {
      flatlistRef.current.scrollToIndex({
        animated: false,
        index: index,
      });
    }
  };

  // function shows loader in between calling the API and getting the response
  const startLoadData = async () => {
    setIsLoading(true);
    const res = await startOfPaginatedData();

    // To check if its the start of list (bottom of list in our case)
    if (res?.conversations?.length == 0) {
      setShouldLoadMoreChatStart(false);
    }
    setResponse(res);
  };

  // Function checks the pagination logic, if it verifies the condition then call startLoadData
  const handleOnStartReached = () => {
    if (!isLoading && conversations?.length > 0) {
      // Checking if conversations length is greater the 15 as it convered all the screen sizes of mobiles, and pagination API will never call if screen is not full messages.
      if (conversations?.length > 15) {
        const newPage = startPage + 1;
        setStartPage(newPage);
        startLoadData();
      }
    }
  };

  const onStartReached = () => {
    loadStartData();
  };

  const onEndReached = () => {
    handleOnEndReached();
  };

  // For Scrolling Up
  const handleOnScroll: ScrollViewProps['onScroll'] = event => {
    const offset = event.nativeEvent.contentOffset.y;
    const visibleLength = event.nativeEvent.layoutMeasurement.height;
    const contentLength = event.nativeEvent.contentSize.height;
    const onStartReachedThreshold = 10;
    const onEndReachedThreshold = 10;

    // Check if scroll has reached start of list.
    const isScrollAtStart = offset < onStartReachedThreshold;
    // Check if scroll has reached end of list.
    const isScrollAtEnd =
      contentLength - visibleLength - offset < onEndReachedThreshold;

    if (isScrollAtStart && shouldLoadMoreChatStart && !isFound) {
      renderFooter();
      onStartReached();
    }

    if (isScrollAtEnd && shouldLoadMoreChatEnd) {
      renderFooter();
      handleLoadMore();
    }
  };

  const renderAllMedia = (
    imageCount: number,
    videosCount: number,
    pdfCount: number,
    val: Conversation,
  ) => {
    return (
      <View style={styles.alignCenter}>
        <Text numberOfLines={2} style={styles.attachment_msg}>
          <Text style={styles.attachment_msg}>{imageCount}</Text>{' '}
          <Image
            source={require('../../assets/images/image_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          <Text style={styles.attachment_msg}>{videosCount}</Text>{' '}
          <Image
            source={require('../../assets/images/video_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          <Text style={styles.attachment_msg}>{pdfCount}</Text>{' '}
          <Image
            source={require('../../assets/images/document_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          {decode(
            val?.answer,
            false,
            chatroomName,
            user?.sdkClientInfo?.community,
          )}
        </Text>
      </View>
    );
  };

  const renderImageVideo = (
    imageCount: number,
    videosCount: number,
    val: Conversation,
  ) => {
    return (
      <View style={styles.alignCenter}>
        <Text numberOfLines={2} style={styles.attachment_msg}>
          <Text style={styles.attachment_msg}>{imageCount}</Text>{' '}
          <Image
            source={require('../../assets/images/image_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          <Text style={styles.attachment_msg}>{videosCount}</Text>{' '}
          <Image
            source={require('../../assets/images/video_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          {decode(
            val?.answer,
            false,
            chatroomName,
            user?.sdkClientInfo?.community,
          )}
        </Text>
      </View>
    );
  };

  const renderVideoPdf = (
    videosCount: number,
    pdfCount: number,
    val: Conversation,
  ) => {
    return (
      <View style={styles.alignCenter}>
        <Text numberOfLines={2} style={styles.attachment_msg}>
          <Text style={styles.attachment_msg}>{videosCount}</Text>{' '}
          <Image
            source={require('../../assets/images/video_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          <Text style={styles.attachment_msg}>{pdfCount}</Text>{' '}
          <Image
            source={require('../../assets/images/document_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          {decode(
            val?.answer,
            false,
            chatroomName,
            user?.sdkClientInfo?.community,
          )}
        </Text>
      </View>
    );
  };

  const renderImagePdf = (
    imageCount: number,
    pdfCount: number,
    val: Conversation,
  ) => {
    return (
      <View style={styles.alignCenter}>
        <Text numberOfLines={2} style={styles.attachment_msg}>
          <Text style={styles.attachment_msg}>{imageCount}</Text>{' '}
          <Image
            source={require('../../assets/images/image_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          <Text style={styles.attachment_msg}>{pdfCount}</Text>{' '}
          <Image
            source={require('../../assets/images/document_icon3x.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          {decode(
            val?.answer,
            false,
            chatroomName,
            user?.sdkClientInfo?.community,
          )}
        </Text>
      </View>
    );
  };

  const renderPdf = (pdfCount: number, val: Conversation) => {
    return (
      <View style={[styles.alignCenter]}>
        {!val?.answer ? (
          <Text style={styles.attachment_msg}>
            {pdfCount > 1 && (
              <Text style={styles.attachment_msg}>{pdfCount}</Text>
            )}{' '}
            <Image
              source={require('../../assets/images/document_icon3x.png')}
              style={styles.chatroomTopicIcon}
            />{' '}
            {pdfCount > 1 ? 'Documents' : 'Document'}
          </Text>
        ) : (
          <Text numberOfLines={2} style={styles.attachment_msg}>
            {pdfCount > 1 && (
              <>
                <Text style={styles.attachment_msg}>{pdfCount}</Text>
                &nbsp;
              </>
            )}
            <Image
              source={require('../../assets/images/document_icon3x.png')}
              style={styles.chatroomTopicIcon}
            />{' '}
            {decode(
              val?.answer,
              false,
              chatroomName,
              user?.sdkClientInfo?.community,
            )}
          </Text>
        )}
      </View>
    );
  };

  const renderVideo = (videosCount: number, val: Conversation) => {
    return (
      <View
        style={[
          styles.alignCenter,
          {
            marginBottom: -2,
          },
        ]}>
        {!val?.answer ? (
          <Text style={styles.attachment_msg}>
            {videosCount > 1 && (
              <Text style={styles.attachment_msg}>{videosCount}</Text>
            )}{' '}
            <Image
              source={require('../../assets/images/video_icon3x.png')}
              style={styles.chatroomTopicIcon}
            />{' '}
            {videosCount > 1 ? 'Videos' : 'Video'}
          </Text>
        ) : (
          <Text numberOfLines={2} style={styles.attachment_msg}>
            {videosCount > 1 && (
              <>
                <Text style={styles.attachment_msg}>{videosCount}</Text>
                &nbsp;
              </>
            )}
            <Image
              source={require('../../assets/images/video_icon3x.png')}
              style={styles.chatroomTopicIcon}
            />{' '}
            {decode(
              val?.answer,
              false,
              chatroomName,
              user?.sdkClientInfo?.community,
            )}
          </Text>
        )}
      </View>
    );
  };

  const renderImage = (imageCount: number, val: Conversation) => {
    return (
      <View style={[styles.alignCenter]}>
        {!val?.answer ? (
          <Text style={styles.attachment_msg}>
            {imageCount > 1 && (
              <Text style={styles.attachment_msg}>{imageCount}</Text>
            )}{' '}
            <Image
              source={require('../../assets/images/image_icon3x.png')}
              style={styles.chatroomTopicIcon}
            />{' '}
            {imageCount > 1 ? 'Photos' : 'Photo'}
          </Text>
        ) : (
          <Text numberOfLines={2} style={styles.attachment_msg}>
            {imageCount > 1 && (
              <>
                <Text style={styles.attachment_msg}>{imageCount}</Text>
                &nbsp;
              </>
            )}
            <Image
              source={require('../../assets/images/image_icon3x.png')}
              style={styles.chatroomTopicIcon}
            />{' '}
            {decode(
              val?.answer,
              false,
              chatroomName,
              user?.sdkClientInfo?.community,
            )}
          </Text>
        )}
      </View>
    );
  };

  const renderPoll = (val: Conversation) => {
    return (
      <View style={[styles.alignCenter]}>
        <Text numberOfLines={2} style={styles.attachment_msg}>
          <Image
            source={require('../../assets/images/poll_icon3x.png')}
            style={[
              styles.chatroomTopicIcon,
              {tintColor: STYLES.$COLORS.PRIMARY},
            ]}
          />{' '}
          {decode(
            val?.answer,
            false,
            chatroomName,
            user?.sdkClientInfo?.community,
          )}
        </Text>
      </View>
    );
  };

  const renderLink = (val: Conversation) => {
    return (
      <View
        style={[
          styles.alignCenter,
          {
            marginBottom: -2,
          },
        ]}>
        <Text numberOfLines={2} style={styles.attachment_msg}>
          <Image
            source={require('../../assets/images/link_icon.png')}
            style={styles.chatroomTopicIcon}
          />{' '}
          {decode(
            val?.answer,
            false,
            chatroomName,
            user?.sdkClientInfo?.community,
          )}
        </Text>
      </View>
    );
  };

  // To get icon along with count along with answer
  const getIconAttachment = (conversation: Conversation) => {
    const attachments = conversation?.attachments;
    let imageCount = 0;
    let videosCount = 0;
    let pdfCount = 0;
    let ogTags = conversation?.ogTags;

    if (attachments?.length) {
      for (let i = 0; i < attachments?.length; i++) {
        if (attachments[i].type == DocumentType.IMAGE) {
          imageCount++;
        } else if (attachments[i].type == DocumentType.VIDEO) {
          videosCount++;
        } else if (attachments[i].type == DocumentType.PDF) {
          pdfCount++;
        } else {
          continue;
        }
      }
    }

    if (imageCount > 0 && videosCount > 0 && pdfCount > 0) {
      return renderAllMedia(imageCount, videosCount, pdfCount, conversation);
    } else if (imageCount > 0 && videosCount > 0) {
      return renderImageVideo(imageCount, videosCount, conversation);
    } else if (videosCount > 0 && pdfCount > 0) {
      return renderVideoPdf(videosCount, pdfCount, conversation);
    } else if (imageCount > 0 && pdfCount > 0) {
      return renderImagePdf(imageCount, pdfCount, conversation);
    } else if (pdfCount > 0) {
      return renderPdf(pdfCount, conversation);
    } else if (videosCount > 0) {
      return renderVideo(videosCount, conversation);
    } else if (imageCount > 0) {
      return renderImage(imageCount, conversation);
    } else if (conversation?.state === 10) {
      return renderPoll(conversation);
    } else if (ogTags) {
      return renderLink(conversation);
    } else {
      return (
        <Text style={styles.deletedMessage}>
          This message is not supported yet
        </Text>
      );
    }
  };

  return (
    <View style={styles.container}>
      {shimmerIsLoading ? (
        <View style={{marginTop: 10}}>
          <View
            style={{
              backgroundColor: '#e8e8e877',
              width: 200,
              paddingLeft: 8,
              paddingVertical: 15,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}>
            <ShimmerPlaceHolder
              style={{width: 150, height: 10, borderRadius: 5}}
            />
            <ShimmerPlaceHolder
              style={{width: 120, height: 10, marginTop: 10, borderRadius: 5}}
            />
          </View>

          <View
            style={{
              backgroundColor: '#e8e8e877',
              alignSelf: 'flex-end',
              width: 200,
              paddingLeft: 8,
              paddingVertical: 15,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              marginTop: 10,
            }}>
            <ShimmerPlaceHolder
              style={{width: 150, height: 10, borderRadius: 5}}
            />
            <ShimmerPlaceHolder
              style={{width: 120, height: 10, marginTop: 10, borderRadius: 5}}
            />
          </View>
          <View
            style={{
              backgroundColor: '#e8e8e877',
              width: 200,
              paddingLeft: 8,
              paddingVertical: 15,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              borderBottomRightRadius: 12,
              marginTop: 10,
            }}>
            <ShimmerPlaceHolder
              style={{width: 150, height: 10, borderRadius: 5}}
            />
            <ShimmerPlaceHolder
              style={{width: 120, height: 10, marginTop: 10, borderRadius: 5}}
            />
          </View>

          <View
            style={{
              backgroundColor: '#e8e8e877',
              alignSelf: 'flex-end',
              width: 200,
              paddingLeft: 8,
              paddingVertical: 15,
              borderTopRightRadius: 12,
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              marginTop: 10,
            }}>
            <ShimmerPlaceHolder
              style={{width: 150, height: 10, borderRadius: 5}}
            />
            <ShimmerPlaceHolder
              style={{width: 120, height: 10, marginTop: 10, borderRadius: 5}}
            />
          </View>
        </View>
      ) : (
        <>
          <FlashList
            ref={flatlistRef}
            data={conversations}
            keyExtractor={(item: any, index) => {
              let isArray = Array.isArray(item);
              return isArray ? `${index}` : `${item?.id}`;
            }}
            extraData={{
              value: [
                selectedMessages,
                uploadingFilesMessages,
                stateArr,
                conversations,
              ],
            }}
            estimatedItemSize={250}
            renderItem={({item: value, index}: any) => {
              let uploadingFilesMessagesIDArr = Object.keys(
                uploadingFilesMessages,
              );
              let item = {...value};
              if (uploadingFilesMessagesIDArr.includes(value?.id?.toString())) {
                item = uploadingFilesMessages[value?.id];
              }

              let isStateIncluded = stateArr.includes(item?.state);

              let isIncluded = selectedMessages.some(
                (val: any) => val?.id === item?.id && !isStateIncluded,
              );

              if (isFound && item?.id == currentChatroomTopic?.id) {
                isIncluded = true;
              }

              return (
                <View>
                  {index < conversations?.length &&
                  conversations[index]?.date !==
                    conversations[index + 1]?.date ? (
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
                      chatroomName={chatroomName}
                      chatroomID={chatroomID}
                      chatroomType={chatroomType}
                      onScrollToIndex={(index: any) => {
                        flatlistRef.current?.scrollToIndex({
                          animated: true,
                          index,
                        });
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
            onScroll={handleOnScroll}
            ListHeaderComponent={renderFooter}
            ListFooterComponent={renderFooter}
            keyboardShouldPersistTaps={'handled'}
            inverted
          />
          {!(Object.keys(currentChatroomTopic).length === 0) &&
          chatroomType !== ChatroomType.DMCHATROOM ? (
            <Pressable
              style={styles.chatroomTop}
              onPress={async () => {
                let index = conversations.findIndex(
                  (element: any) => element?.id == currentChatroomTopic?.id,
                );
                if (index >= 0) {
                  if (!flashListMounted) {
                    setTimeout(() => {
                      flatlistRef.current?.scrollToIndex({
                        animated: true,
                        index,
                      });
                      setIsFound(true);
                      setFlashListMounted(true);
                    }, 1000);
                  } else {
                    flatlistRef.current?.scrollToIndex({
                      animated: true,
                      index,
                    });
                    setIsFound(true);
                  }
                } else {
                  const newConversation = await getCurrentConversation(
                    currentChatroomTopic,
                    chatroomID?.toString(),
                  );
                  dispatch({
                    type: GET_CONVERSATIONS_SUCCESS,
                    body: {conversations: newConversation},
                  });
                  let index = newConversation.findIndex(
                    element => element?.id == currentChatroomTopic?.id,
                  );
                  if (index >= 0) {
                    flatlistRef.current?.scrollToIndex({
                      animated: true,
                      index,
                    });
                    setIsFound(true);
                  }
                }
              }}>
              <View style={styles.chatroomTopic}>
                <View>
                  <Image
                    source={
                      !!currentChatroomTopic?.member?.imageUrl
                        ? {uri: currentChatroomTopic?.member?.imageUrl}
                        : require('../../assets/images/default_pic.png')
                    }
                    style={styles.chatroomTopicAvatar}
                  />
                </View>
                <View style={styles.chatRoomTopicInfo}>
                  <Text
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={{
                      color: STYLES.$COLORS.PRIMARY,
                      fontSize: STYLES.$FONT_SIZES.LARGE,
                      fontFamily: STYLES.$FONT_TYPES.BOLD,
                    }}>
                    Current Topic
                  </Text>

                  {currentChatroomTopic?.hasFiles == true ? (
                    getIconAttachment(currentChatroomTopic)
                  ) : currentChatroomTopic?.state === 10 ? (
                    getIconAttachment(currentChatroomTopic)
                  ) : currentChatroomTopic?.ogTags?.url !== null &&
                    currentChatroomTopic?.ogTags ? (
                    getIconAttachment(currentChatroomTopic)
                  ) : (
                    <Text
                      ellipsizeMode="tail"
                      numberOfLines={2}
                      style={{
                        color: STYLES.$COLORS.MSG,
                        fontSize: STYLES.$FONT_SIZES.MEDIUM,
                        fontFamily: STYLES.$FONT_TYPES.LIGHT,
                        lineHeight: 18,
                      }}>
                      {decode(
                        currentChatroomTopic?.answer,
                        false,
                        chatroomName,
                        user?.sdkClientInfo?.community,
                      )}
                    </Text>
                  )}
                </View>
                <View>
                  {currentChatroomTopic?.attachmentCount > 0 &&
                  currentChatroomTopic?.attachments.length > 0 &&
                  currentChatroomTopic?.attachments[0]?.type !== 'pdf' ? (
                    <Image
                      source={{
                        uri:
                          currentChatroomTopic?.attachments[0]?.type == 'image'
                            ? currentChatroomTopic?.attachments[0]?.url
                            : currentChatroomTopic?.attachments[0]
                                ?.thumbnailUrl,
                      }}
                      style={styles.chatroomTopicAttachment}
                    />
                  ) : currentChatroomTopic?.ogTags?.url !== null &&
                    currentChatroomTopic?.ogTags?.image !== '' &&
                    currentChatroomTopic?.ogTags !== undefined &&
                    currentChatroomTopic?.ogTags !== null &&
                    Object.keys(currentChatroomTopic).length !== 0 ? (
                    <Image
                      source={{
                        uri: currentChatroomTopic?.ogTags?.image,
                      }}
                      style={styles.chatroomTopicAttachment}
                    />
                  ) : null}
                </View>
              </View>
            </Pressable>
          ) : null}
        </>
      )}

      <View
        style={{
          marginTop: 'auto',
        }}>
        {/* if chatroomType !== 10 (Not DM) then show group bottom changes, else if chatroomType === 10 (DM) then show DM bottom changes */}
        {chatroomType !== ChatroomType.DMCHATROOM &&
        memberRights?.length > 0 ? (
          <View>
            {!(Object.keys(chatroomDBDetails)?.length === 0) &&
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
            {!(Object.keys(chatroomDBDetails)?.length === 0) ? (
              //case to block normal user from messaging in a chatroom where only CMs can message
              user.state !== 1 &&
              chatroomDBDetails?.memberCanMessage === false ? (
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>
                    Only Community Manager can message here.
                  </Text>
                </View>
              ) : //case to allow CM for messaging in an Announcement Room
              !(user.state !== 1 && chatroomDBDetails?.type === 7) &&
                chatroomFollowStatus &&
                memberRights[3]?.isSelected === true ? (
                <InputBox
                  chatroomName={chatroomName}
                  chatroomWithUser={chatroomWithUser}
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
                  chatroomType={chatroomType}
                  currentChatroomTopic={currentChatroomTopic}
                />
              ) : //case to block normal users from messaging in an Announcement Room
              user.state !== 1 && chatroomDBDetails?.type === 7 ? (
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>
                    Only Community Manager can message here.
                  </Text>
                </View>
              ) : memberRights[3]?.isSelected === false ? (
                <View style={styles.disabledInput}>
                  <Text style={styles.disabledInputText}>
                    The community managers have restricted you from responding
                    here.
                  </Text>
                </View>
              ) : !(Object.keys(chatroomDBDetails)?.length === 0) &&
                previousRoute?.name === HOMEFEED &&
                isRealmDataPresent ? (
                <View
                  style={{
                    padding: 20,
                    backgroundColor: STYLES.$COLORS.TERTIARY,
                  }}>
                  <Text
                    style={
                      styles.inviteText
                    }>{`${chatroomDBDetails?.header} invited you to join this secret group.`}</Text>
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
        ) : chatroomType === ChatroomType.DMCHATROOM &&
          memberRights?.length > 0 ? (
          <View>
            {chatRequestState === 0 &&
            (!!chatroomDBDetails?.chatRequestedBy
              ? chatroomDBDetails?.chatRequestedBy?.id !== user?.id?.toString()
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
                isPrivateMember={chatroomDBDetails?.isPrivateMember}
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
      </View>

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
                      if (val?.id === ChatroomActions.VIEW_PARTICIPANTS) {
                        setModalVisible(false);
                        navigation.navigate(VIEW_PARTICIPANTS, {
                          chatroomID: chatroomID,
                          isSecret: isSecret,
                          chatroomName: chatroomName,
                        });
                      } else if (
                        val?.id === ChatroomActions.LEAVE_CHATROOM ||
                        val?.id === ChatroomActions.LEAVE_SECRET_CHATROOM
                      ) {
                        showWarningModal();
                        setModalVisible(false);
                      } else if (val?.id === ChatroomActions.JOIN_CHATROOM) {
                        if (!isSecret) {
                          joinChatroom();
                        }
                        setModalVisible(false);
                      } else if (
                        val?.id === ChatroomActions.MUTE_NOTIFICATIONS
                      ) {
                        await muteNotifications();
                        setModalVisible(false);
                      } else if (
                        val?.id === ChatroomActions.UNMUTE_NOTIFICATIONS
                      ) {
                        await unmuteNotifications();
                        setModalVisible(false);
                      } else if (val?.id === ChatroomActions.VIEW_PROFILE) {
                        //View Profile code
                      } else if (val?.id === ChatroomActions.BLOCK_MEMBER) {
                        await handleBlockMember();
                        setModalVisible(false);
                      } else if (val?.id === ChatroomActions.UNBLOCK_MEMBER) {
                        await unblockMember();
                        setModalVisible(false);
                      } else if (val?.id === ChatroomActions.SHARE) {
                        // Share flow
                        onShare(
                          chatroomID,
                          chatroomType,
                          chatroomDBDetails?.isSecret,
                        );
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
        visible={reportModalVisible && selectedMessages?.length == 1}
        onRequestClose={() => {
          setReportModalVisible(!modalVisible);
        }}>
        <Pressable style={styles.centeredView} onPress={handleReportModalClose}>
          <View>
            <Pressable onPress={() => {}} style={[styles.modalView]}>
              {isMessagePrivately ? (
                <TouchableOpacity
                  onPress={() => {
                    let uuid = selectedMessages[0]?.member?.sdkClientInfo?.uuid;

                    onReplyPrivatelyClick(uuid, selectedMessages[0]?.id);
                    dispatch({type: SELECTED_MESSAGES, body: []});
                    setReportModalVisible(false);
                    // handleReportModalClose()
                  }}
                  style={styles.filtersView}>
                  <Text style={styles.filterText}>Message Privately</Text>
                </TouchableOpacity>
              ) : null}

              {isChatroomTopic && chatroomType !== ChatroomType.DMCHATROOM ? (
                <TouchableOpacity
                  onPress={async () => {
                    setChatroomTopic();
                    setReportModalVisible(false);
                  }}
                  style={styles.filtersView}>
                  <Text style={styles.filterText}>Set chatroom topic</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(REPORT, {
                    conversationID: selectedMessages[0]?.id,
                    chatroomID: chatroomID,
                    selectedMessages: selectedMessages[0],
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
                      sendReaction(val, false);
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
