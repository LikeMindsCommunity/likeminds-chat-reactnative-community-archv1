import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Modal,
  Pressable,
  Keyboard,
  Alert,
  PermissionsAndroid,
  Linking,
  ActivityIndicator,
} from 'react-native';
import React, {FC, useEffect, useRef, useState} from 'react';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../../store';
import {onConversationsCreate} from '../../store/actions/chatroom';
import {
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  EDIT_CONVERSATION,
  FILE_SENT,
  IS_FILE_UPLOADING,
  LONG_PRESSED,
  MESSAGE_SENT,
  SELECTED_FILES_TO_UPLOAD,
  SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
  SELECTED_FILE_TO_VIEW,
  SELECTED_MESSAGES,
  SELECTED_MORE_FILES_TO_UPLOAD,
  SET_EDIT_MESSAGE,
  SET_FILE_UPLOADING_MESSAGES,
  SET_IS_REPLY,
  SET_REPLY_MESSAGE,
  SHOW_TOAST,
  STATUS_BAR_STYLE,
  UPDATE_CHAT_REQUEST_STATE,
  UPDATE_CONVERSATIONS,
  UPDATE_LAST_CONVERSATION,
  EMPTY_BLOCK_DELETION,
  UPDATE_MULTIMEDIA_CONVERSATIONS,
  GET_CONVERSATIONS_SUCCESS,
} from '../../store/types/types';
import {ReplyBox} from '../ReplyConversations';
import {chatSchema} from '../../assets/chatSchema';
import {myClient} from '../../..';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {CREATE_POLL_SCREEN, FILE_UPLOAD} from '../../constants/Screens';
import STYLES from '../../constants/Styles';
import SendDMRequestModal from '../../customModals/SendDMRequest';
import {
  AUDIO_TEXT,
  BLOCKED_DM,
  CAMERA_TEXT,
  CHARACTER_LIMIT_MESSAGE,
  DOCUMENTS_TEXT,
  FAILED,
  IMAGE_TEXT,
  PDF_TEXT,
  PHOTOS_AND_VIDEOS_TEXT,
  POLL_TEXT,
  SUCCESS,
  VIDEO_TEXT,
} from '../../constants/Strings';
import {CognitoIdentityCredentials, S3} from 'aws-sdk';
import AWS from 'aws-sdk';
import {BUCKET, POOL_ID, REGION} from '../../aws-exports';
import {
  REGEX_USER_TAGGING,
  decode,
  detectMentions,
  extractPathfromRouteQuery,
  fetchResourceFromURI,
  getAllPdfThumbnail,
  getPdfThumbnail,
  getVideoThumbnail,
  replaceLastMention,
} from '../../commonFuctions';
import {
  requestCameraPermission,
  requestStoragePermission,
} from '../../utils/permissions';
import {FlashList} from '@shopify/flash-list';
import {TaggingView} from '../TaggingView';
import {
  convertToMentionValues,
  replaceMentionValues,
} from '../TaggingView/utils';
import {ChatroomChatRequestState} from '../../enums';
import {ChatroomType} from '../../enums';
import {InputBoxProps, LaunchActivityProps} from './models';
import {LINK_PREVIEW_REGEX, URL_REGEX} from '../../constants/Regex';
import {LinkPreviewSnapProps} from './models/LinkPreviewSnapProps';

export const LinkPreviewSnap = ({ogTags}: LinkPreviewSnapProps) => {
  return (
    <View style={styles.linkPreviewBox}>
      <View style={styles.linkPreviewImageView}>
        {!!ogTags?.image ? (
          <Image source={{uri: ogTags?.image}} style={styles.linkPreviewIcon} />
        ) : (
          <Image
            source={require('../../assets/images/defaultLinkPreview.png')}
            style={styles.linkPreviewIcon}
          />
        )}
      </View>
      <View style={styles.linkPreviewTextView}>
        <View>
          <Text style={styles.linkPreviewTitle} numberOfLines={2}>
            {ogTags?.title}
          </Text>
        </View>
        <View style={styles.alignRow}>
          <Text style={styles.linkPreviewMessageText} numberOfLines={1}>
            {ogTags?.description}
          </Text>
        </View>
        <View style={styles.alignRow}>
          <Text style={styles.linkPreviewMessageText} numberOfLines={1}>
            {ogTags?.url}
          </Text>
        </View>
      </View>
    </View>
  );
};

const InputBox = ({
  replyChatID,
  chatroomID,
  chatRequestState,
  chatroomType,
  navigation,
  isUploadScreen,
  isPrivateMember,
  isDoc,
  myRef,
  previousMessage = '',
  handleFileUpload,
  isEditable,
  setIsEditable,
  isSecret,
  chatroomWithUser,
}: InputBoxProps) => {
  const [isKeyBoardFocused, setIsKeyBoardFocused] = useState(false);
  const [message, setMessage] = useState(previousMessage);
  const [formattedConversation, setFormattedConversation] =
    useState(previousMessage);
  const [inputHeight, setInputHeight] = useState(25);
  const [showEmoji, setShowEmoji] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pollModalVisible, setPollModalVisible] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [s3UploadResponse, setS3UploadResponse] = useState<any>();
  const [DMSentAlertModalVisible, setDMSentAlertModalVisible] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<any>(null);
  const [debounceLinkPreviewTimeout, setLinkPreviewDebounceTimeout] =
    useState<any>(null);
  const [isUserTagging, setIsUserTagging] = useState(false);
  const [userTaggingList, setUserTaggingList] = useState<any>([]);
  const [userTaggingListHeight, setUserTaggingListHeight] = useState<any>(116);
  const [groupTags, setGroupTags] = useState<any>([]);
  const [taggedUserName, setTaggedUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [ogTagsState, setOgTagsState] = useState<any>({});
  const [closedOnce, setClosedOnce] = useState(false);
  const [showLinkPreview, setShowLinkPreview] = useState(true);
  const [url, setUrl] = useState('');

  const MAX_FILE_SIZE = 104857600; // 100MB in bytes
  const MAX_LENGTH = 300;

  const {
    selectedFilesToUpload = [],
    selectedFilesToUploadThumbnails = [],
    conversations = [],
    selectedMessages = [],
  }: any = useAppSelector(state => state.chatroom);
  const {myChatrooms, user, community}: any = useAppSelector(
    state => state.homefeed,
  );
  const {
    chatroomDetails,
    isReply,
    replyMessage,
    editConversation,
    fileSent,
  }: any = useAppSelector(state => state.chatroom);
  const {uploadingFilesMessages}: any = useAppSelector(state => state.upload);

  const dispatch = useAppDispatch();
  let conversationArrayLength = conversations.length;

  AWS.config.update({
    region: REGION, // Replace with your AWS region, e.g., 'us-east-1'
    credentials: new CognitoIdentityCredentials({
      IdentityPoolId: POOL_ID, // Replace with your Identity Pool ID
    }),
  });

  const s3 = new S3();

  // to clear message on ChatScreen InputBox when fileSent from UploadScreen
  useEffect(() => {
    if (!isUploadScreen) {
      setMessage('');
      setFormattedConversation('');
      setInputHeight(25);
    }
  }, [fileSent]);

  // to clear message on ChatScreen InputBox when fileSent from UploadScreen
  useEffect(() => {
    if (isEditable) {
      let convertedText = convertToMentionValues(
        `${editConversation?.answer} `, // to put extra space after a message whwn we want to edit a message
        ({URLwithID, name}) => {
          if (!!!URLwithID) {
            return `@[${name}](${name})`;
          } else {
            return `@[${name}](${URLwithID})`;
          }
        },
      );
      setMessage(convertedText);
    }
  }, [isEditable, selectedMessages]);

  const handleVideoThumbnail = async (images: any) => {
    const res = await getVideoThumbnail({
      selectedImages: images,
      initial: true,
    });
    dispatch({
      type: SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
      body: {
        images: res?.selectedFilesToUploadThumbnails,
      },
    });
    dispatch({
      type: SELECTED_FILES_TO_UPLOAD,
      body: {
        images: res?.selectedFilesToUpload,
      },
    });
  };

  // this method sets image and video to upload on FileUpload screen via redux.
  const handleImageAndVideoUpload = async (selectedImages: Asset[]) => {
    if (!!selectedImages) {
      if (isUploadScreen === false) {
        // to select images and videos from chatroom.
        await handleVideoThumbnail(selectedImages);
        dispatch({
          type: SELECTED_FILE_TO_VIEW,
          body: {image: selectedImages[0]},
        });
        dispatch({
          type: STATUS_BAR_STYLE,
          body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
        });
      } else {
        // to select more images and videos on FileUpload screen (isUploadScreen === true)

        const res = await getVideoThumbnail({
          // selected files will be saved in redux inside get video function
          selectedImages,
          selectedFilesToUpload,
          selectedFilesToUploadThumbnails,
          initial: false,
        });
        dispatch({
          type: SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
          body: {
            images: res?.selectedFilesToUploadThumbnails,
          },
        });
        dispatch({
          type: SELECTED_FILES_TO_UPLOAD,
          body: {
            images: selectedImages[0],
          },
        });
      }
    }
  };

  //select Images and videoes From Gallery
  const selectGallery = async () => {
    const options: LaunchActivityProps = {
      mediaType: 'mixed',
      selectionLimit: 0,
    };
    navigation.navigate(FILE_UPLOAD, {
      chatroomID: chatroomID,
      previousMessage: message, // to keep message on uploadScreen InputBox
    });
    await launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response?.didCancel) {
        if (selectedFilesToUpload.length === 0) {
          navigation.goBack();
        }
      } else if (response.errorCode) {
        return;
      } else {
        let selectedImages: Asset[] | undefined = response.assets; // selectedImages can be anything images or videos or both

        if (!selectedImages) return;
        for (let i = 0; i < selectedImages?.length; i++) {
          let fileSize = selectedImages[i]?.fileSize;
          if (Number(fileSize) >= MAX_FILE_SIZE) {
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Files above 100 MB is not allowed'},
            });
            navigation.goBack();
            return;
          }
        }
        handleImageAndVideoUpload(selectedImages);
      }
    });
  };

  //select Documents From Gallery
  const selectDoc = async () => {
    try {
      navigation.navigate(FILE_UPLOAD, {
        chatroomID: chatroomID,
        previousMessage: message, // to keep message on uploadScreen InputBox
      });
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });
      let selectedDocs: any = response; // selectedImages can be anything images or videos or both
      let docsArrlength = selectedDocs?.length;
      if (docsArrlength > 0) {
        for (let i = 0; i < docsArrlength; i++) {
          if (selectedDocs[i].size >= MAX_FILE_SIZE) {
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Files above 100 MB is not allowed'},
            });
            navigation.goBack();
            return;
          }
        }
        if (isUploadScreen === false) {
          let allThumbnailsArr = await getAllPdfThumbnail(selectedDocs);

          //loop is for appending thumbanil in the object we get from document picker
          for (let i = 0; i < selectedDocs?.length; i++) {
            selectedDocs[i] = {
              ...selectedDocs[i],
              thumbnailUrl: allThumbnailsArr[i]?.uri,
            };
          }

          //redux action to save thumbnails for bottom horizontal scroll list in fileUpload, it does not need to have complete pdf, only thumbnail is fine
          dispatch({
            type: SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
            body: {images: allThumbnailsArr},
          });

          //redux action to save thumbnails along with pdf to send and view on fileUpload screen
          dispatch({
            type: SELECTED_FILES_TO_UPLOAD,
            body: {images: selectedDocs},
          });
          let res: any = await getPdfThumbnail(selectedDocs[0]);

          //redux action to save thumbnail of selected file
          dispatch({
            type: SELECTED_FILE_TO_VIEW,
            body: {image: {...selectedDocs[0], thumbnailUrl: res[0]?.uri}},
          });

          //redux action to change status bar color
          dispatch({
            type: STATUS_BAR_STYLE,
            body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
          });
        } else if (isUploadScreen === true) {
          let arr: any = await getAllPdfThumbnail(selectedDocs);
          for (let i = 0; i < selectedDocs?.length; i++) {
            selectedDocs[i] = {...selectedDocs[i], thumbnailUrl: arr[i]?.uri};
          }

          //redux action to select more files to upload
          dispatch({
            type: SELECTED_MORE_FILES_TO_UPLOAD,
            body: {images: selectedDocs},
          });

          //redux action to save thumbnail of selected files. It saves thumbnail as URI only not as thumbnail property
          dispatch({
            type: SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
            body: {images: [...selectedFilesToUploadThumbnails, ...arr]},
          });
        }
      }
    } catch (error) {
      if (selectedFilesToUpload.length === 0) {
        navigation.goBack();
      }
    }
  };

  // this method launches native camera
  const openCamera = async () => {
    const options: LaunchActivityProps = {
      mediaType: 'photo',
      selectionLimit: 0,
    };
    navigation.navigate(FILE_UPLOAD, {
      chatroomID: chatroomID,
      previousMessage: message, // to keep message on uploadScreen InputBox
    });
    await launchCamera(options, async (response: ImagePickerResponse) => {
      if (response?.didCancel) {
        if (selectedFilesToUpload.length === 0) {
          navigation.goBack();
        }
      } else if (response.errorCode) {
        return;
      } else {
        let selectedImages: Asset[] | undefined = response.assets; // selectedImages would be images only

        if (!selectedImages) return;
        if (selectedImages?.length > 0) {
          let fileSize = selectedImages[0]?.fileSize;
          if (Number(fileSize) >= MAX_FILE_SIZE) {
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Files above 100 MB is not allowed'},
            });
            navigation.goBack();
            return;
          }
        }

        handleImageAndVideoUpload(selectedImages);
      }
    });
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyBoardFocused(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyBoardFocused(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // function calls a confirm alert which will further call onSend function onConfirm.
  const sendDmRequest = () => {
    showDMSentAlert();
  };

  const showDMSentAlert = () => {
    setDMSentAlertModalVisible(true);
  };

  const hideDMSentAlert = () => {
    setDMSentAlertModalVisible(false);
  };

  // function handles opening of camera functionality
  const handleCamera = async () => {
    if (Platform.OS === 'ios') {
      openCamera();
    } else {
      let res = await requestCameraPermission();
      if (res === true) {
        openCamera();
      }
    }
  };

  // function handles the selection of images and videos
  const handleGallery = async () => {
    if (Platform.OS === 'ios') {
      selectGallery();
    } else {
      let res = await requestStoragePermission();
      if (res === true) {
        selectGallery();
      }
    }
  };

  // function handles the slection of documents
  const handleDoc = async () => {
    if (Platform.OS === 'ios') {
      selectDoc();
    } else {
      let res = await requestStoragePermission();
      if (res === true) {
        selectDoc();
      }
    }
  };

  const onSend = async (conversation: string) => {
    setMessage('');
    setInputHeight(25);
    // -- Code for local message handling for normal and reply for now
    let months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    let time = new Date(Date.now());
    let hr = time.getHours();
    let min = time.getMinutes();
    let ID = Date.now();
    let attachmentsCount = selectedFilesToUpload?.length; //if any

    let dummySelectedFileArr: any = []; //if any
    let dummyAttachmentsArr: any = []; //if any

    if (attachmentsCount > 0) {
      for (let i = 0; i < attachmentsCount; i++) {
        let attachmentType = selectedFilesToUpload[i]?.type?.split('/')[0];
        let docAttachmentType = selectedFilesToUpload[i]?.type?.split('/')[1];
        if (attachmentType === IMAGE_TEXT) {
          let obj = {
            imageUrl: selectedFilesToUpload[i].uri,
            index: i,
          };
          dummySelectedFileArr = [...dummySelectedFileArr, obj];
        } else if (attachmentType === VIDEO_TEXT) {
          let obj = {
            videoUrl: selectedFilesToUpload[i].uri,
            index: i,
            thumbnailUrl: selectedFilesToUpload[i].thumbanil,
          };
          dummySelectedFileArr = [...dummySelectedFileArr, obj];
        } else if (docAttachmentType === PDF_TEXT) {
          let obj = {
            pdfFile: selectedFilesToUpload[i].uri,
            index: i,
          };
          dummySelectedFileArr = [...dummySelectedFileArr, obj];
        }
      }
    }

    if (attachmentsCount > 0) {
      for (let i = 0; i < attachmentsCount; i++) {
        let attachmentType = selectedFilesToUpload[i]?.type?.split('/')[0];
        let docAttachmentType = selectedFilesToUpload[i]?.type?.split('/')[1];
        let URI = selectedFilesToUpload[i].uri;
        if (attachmentType === IMAGE_TEXT) {
          let obj = {
            ...selectedFilesToUpload[i],
            type: attachmentType,
            url: URI,
            index: i,
          };
          dummyAttachmentsArr = [...dummyAttachmentsArr, obj];
        } else if (attachmentType === VIDEO_TEXT) {
          let obj = {
            ...selectedFilesToUpload[i],
            type: attachmentType,
            url: URI,
            thumbnailUrl: selectedFilesToUpload[i].thumbnailUrl,
            index: i,
            name: selectedFilesToUpload[i].fileName,
          };
          dummyAttachmentsArr = [...dummyAttachmentsArr, obj];
        } else if (docAttachmentType === PDF_TEXT) {
          let obj = {
            ...selectedFilesToUpload[i],
            type: docAttachmentType,
            url: URI,
            index: i,
            name: selectedFilesToUpload[i].name,
          };
          dummyAttachmentsArr = [...dummyAttachmentsArr, obj];
        }
      }
    }

    let conversationText = replaceMentionValues(conversation, ({id, name}) => {
      // example ID = `user_profile/8619d45e-9c4c-4730-af8e-4099fe3dcc4b`
      let PATH = extractPathfromRouteQuery(id);
      if (!!!PATH) {
        let newName = name.substring(1);
        return `<<${name}|route://${newName}>>`;
      } else {
        return `<<${name}|route://${id}>>`;
      }
    });

    const isMessageTrimmed = !!conversation.trim();

    // check if message is empty string or not
    if ((isMessageTrimmed && !isUploadScreen) || isUploadScreen) {
      let replyObj = chatSchema.reply;
      if (isReply) {
        replyObj.replyConversation = replyMessage?.id?.toString();
        replyObj.replyConversationObject = replyMessage;
        replyObj.member.name = user?.name;
        replyObj.member.id = user?.id?.toString();
        replyObj.member.sdkClientInfo = user?.sdkClientInfo;
        replyObj.member.uuid = user?.uuid;
        replyObj.answer = conversationText?.trim()?.toString();
        replyObj.createdAt = `${hr.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}:${min.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}`;
        replyObj.id = ID?.toString();
        replyObj.chatroomId = chatroomDetails?.chatroom?.id?.toString();
        replyObj.communityId = community?.id?.toString();
        replyObj.date = `${
          time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
        } ${months[time.getMonth()]} ${time.getFullYear()}`;
        replyObj.chatroomId = chatroomDetails?.chatroom?.id?.toString();
        replyObj.communityId = community?.id?.toString();
        replyObj.date = `${
          time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
        } ${months[time.getMonth()]} ${time.getFullYear()}`;
        replyObj.attachmentCount = attachmentsCount;
        replyObj.attachments = dummyAttachmentsArr;
        replyObj.hasFiles = attachmentsCount > 0 ? true : false;
        replyObj.attachmentsUploaded = attachmentsCount > 0 ? true : false;
        replyObj.images = dummySelectedFileArr;
        replyObj.videos = dummySelectedFileArr;
        replyObj.pdf = dummySelectedFileArr;
        replyObj.ogTags = ogTagsState;
      }
      let obj = chatSchema.normal;
      obj.member.name = user?.name;
      obj.member.id = user?.id?.toString();
      obj.member.sdkClientInfo = user?.sdkClientInfo;
      obj.member.uuid = user?.uuid;
      obj.answer = conversationText?.trim()?.toString();
      obj.createdAt = `${hr.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}:${min.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;
      obj.id = ID?.toString();
      obj.chatroomId = chatroomDetails?.chatroom?.id?.toString();
      obj.communityId = community?.id?.toString();
      obj.date = `${
        time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
      } ${months[time.getMonth()]} ${time.getFullYear()}`;
      obj.attachmentCount = attachmentsCount;
      obj.attachments = dummyAttachmentsArr;
      obj.hasFiles = attachmentsCount > 0 ? true : false;
      obj.attachmentsUploaded = attachmentsCount > 0 ? true : false;
      obj.images = dummySelectedFileArr;
      obj.videos = dummySelectedFileArr;
      obj.pdf = dummySelectedFileArr;
      obj.ogTags = ogTagsState;

      dispatch({
        type: UPDATE_CONVERSATIONS,
        body: isReply
          ? {obj: {...replyObj, isInProgress: SUCCESS}}
          : {obj: {...obj, isInProgress: SUCCESS}},
      });

      dispatch({
        type: MESSAGE_SENT,
        body: isReply ? {id: replyObj?.id} : {id: obj?.id},
      });

      if (
        chatroomType !== ChatroomType.DMCHATROOM && // if not DM
        chatRequestState !== null // if not first DM message sent to an user
      ) {
        if (isReply) {
          if (attachmentsCount > 0) {
            const editedReplyObj = {...replyObj, isInProgress: SUCCESS};
            await myClient?.saveNewConversation(
              chatroomID.toString(),
              editedReplyObj,
            );
          } else {
            await myClient?.saveNewConversation(
              chatroomID.toString(),
              replyObj,
            );
          }
        } else {
          if (attachmentsCount > 0) {
            const editedObj = {...obj, isInProgress: SUCCESS};
            await myClient?.saveNewConversation(
              chatroomID.toString(),
              editedObj,
            );
          } else {
            await myClient?.saveNewConversation(chatroomID.toString(), obj);
          }
        }
      }

      if (isUploadScreen) {
        dispatch({
          type: CLEAR_SELECTED_FILES_TO_UPLOAD,
        });
        dispatch({
          type: CLEAR_SELECTED_FILE_TO_VIEW,
        });
      }

      if (isReply) {
        dispatch({type: SET_IS_REPLY, body: {isReply: false}});
        dispatch({type: SET_REPLY_MESSAGE, body: {replyMessage: ''}});
      }

      // -- Code for local message handling ended

      // condition for request DM for the first time
      if (
        chatroomType === ChatroomType.DMCHATROOM && // if DM
        chatRequestState === null &&
        isPrivateMember // isPrivateMember = false when none of the member on both sides is CM.
      ) {
        let response = await myClient?.sendDMRequest({
          chatroomId: chatroomID,
          chatRequestState: ChatroomChatRequestState.INITIATED,
          text: conversation?.trim(),
        });

        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: 'Direct messaging request sent'},
        });

        //dispatching redux action for local handling of chatRequestState
        dispatch({
          type: UPDATE_CHAT_REQUEST_STATE,
          body: {chatRequestState: ChatroomChatRequestState.INITIATED},
        });
        await myClient?.saveNewConversation(
          chatroomID.toString(),
          response?.data?.conversation,
        );
        await myClient?.updateChatRequestState(
          chatroomID.toString(),
          ChatroomChatRequestState.INITIATED,
        );
      } else if (
        chatroomType === ChatroomType.DMCHATROOM && // if DM
        chatRequestState === null &&
        !isPrivateMember // isPrivateMember = false when none of the member on both sides is CM.
      ) {
        let response = await myClient?.sendDMRequest({
          chatroomId: chatroomID,
          chatRequestState: ChatroomChatRequestState.ACCEPTED,
          text: conversation?.trim(),
        });

        dispatch({
          type: UPDATE_CHAT_REQUEST_STATE,
          body: {chatRequestState: ChatroomChatRequestState.ACCEPTED},
        });
        await myClient?.saveNewConversation(
          chatroomID.toString(),
          response?.data?.conversation,
        );
        await myClient?.updateChatRequestState(
          chatroomID.toString(),
          ChatroomChatRequestState.ACCEPTED,
        );
      } else {
        if (!isUploadScreen) {
          let payload: any = {
            chatroomId: chatroomID,
            hasFiles: false,
            text: conversationText?.trim(),
            temporaryId: ID?.toString(),
            attachmentCount: attachmentsCount,
            repliedConversationId: replyMessage?.id,
          };

          if (Object.keys(ogTagsState).length !== 0 && url && !closedOnce) {
            payload.ogTags = ogTagsState;
          } else if (url && !closedOnce) {
            payload.shareLink = url;
          }

          let response = await dispatch(onConversationsCreate(payload) as any);

          if (!!response) {
            await myClient?.replaceSavedConversation(response?.conversation);
          }

          //Handling conversation failed case
          if (response === undefined) {
            dispatch({
              type: SHOW_TOAST,
              body: {
                isToast: true,
                msg: BLOCKED_DM,
              },
            });
            dispatch({
              type: EMPTY_BLOCK_DELETION,
              body: {},
            });
          }
        } else {
          dispatch({
            type: FILE_SENT,
            body: {status: !fileSent},
          });
          navigation.goBack();
          let payload: any = {
            chatroomId: chatroomID,
            hasFiles: false,
            text: conversationText?.trim(),
            temporaryId: ID?.toString(),
            attachmentCount: attachmentsCount,
            repliedConversationId: replyMessage?.id,
          };

          if (Object.keys(ogTagsState).length !== 0 && url && !closedOnce) {
            payload.ogTags = ogTagsState;
          } else if (url && !closedOnce) {
            payload.shareLink = url;
          }

          let response = await dispatch(onConversationsCreate(payload) as any);

          await myClient?.replaceSavedConversation(response?.conversation);

          if (response === undefined) {
            dispatch({
              type: SHOW_TOAST,
              body: {
                isToast: true,
                msg: 'Message not sent. Please check your internet connection',
              },
            });
          } else if (response) {
            // start uploading
            dispatch({
              type: SET_FILE_UPLOADING_MESSAGES,
              body: {
                message: isReply
                  ? {
                      ...replyObj,
                      id: response?.id,
                      temporaryId: ID,
                      isInProgress: SUCCESS,
                    }
                  : {
                      ...obj,
                      id: response?.id,
                      temporaryId: ID,
                      isInProgress: SUCCESS,
                    },
                ID: response?.id,
              },
            });

            let id = response?.id;
            let message = isReply
              ? {
                  ...replyObj,
                  id: response?.id,
                  temporaryId: ID,
                  isInProgress: SUCCESS,
                }
              : {
                  ...obj,
                  id: response?.id,
                  temporaryId: ID,
                  isInProgress: SUCCESS,
                };

            await myClient?.saveAttachmentUploadConversation(
              id.toString(),
              JSON.stringify(message),
            );

            await handleFileUpload(response?.id, false);
          }
          dispatch({
            type: STATUS_BAR_STYLE,
            body: {color: STYLES.$STATUS_BAR_STYLE.default},
          });
        }
      }
    }
    setShowLinkPreview(false);
    setOgTagsState({});
    setUrl('');
    setClosedOnce(false);
  };

  const taggingAPI = async ({page, searchName, chatroomId, isSecret}: any) => {
    const res = await myClient?.getTaggingList({
      page: page,
      pageSize: 10,
      searchName: searchName,
      chatroomId: chatroomId,
      isSecret: isSecret,
    });
    return res?.data;
  };

  // function shows loader in between calling the API and getting the response
  const loadData = async (newPage: number) => {
    setIsLoading(true);
    const res = await taggingAPI({
      page: newPage,
      searchName: taggedUserName,
      chatroomId: chatroomID,
      isSecret: isSecret,
    });
    if (!!res) {
      isSecret
        ? setUserTaggingList([...userTaggingList, ...res?.chatroomParticipants])
        : setUserTaggingList([...userTaggingList, ...res?.communityMembers]);
      setIsLoading(false);
    }
  };

  //function checks the pagination logic, if it verifies the condition then call loadData
  const handleLoadMore = () => {
    let userTaggingListLength = userTaggingList.length;
    if (!isLoading && userTaggingListLength > 0) {
      // checking if conversations length is greater the 15 as it convered all the screen sizes of mobiles, and pagination API will never call if screen is not full messages.
      if (userTaggingListLength >= 10 * page) {
        const newPage = page + 1;
        setPage(newPage);
        loadData(newPage);
      }
    }
  };

  //pagination loader in the footer
  const renderFooter = () => {
    return isLoading ? (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
      </View>
    ) : null;
  };

  async function detectLinkPreview(link: string) {
    const payload = {
      url: link,
    };
    const decodeUrlResponse = await myClient?.decodeUrl(payload);
    const ogTags = decodeUrlResponse?.data?.ogTags;
    if (ogTags !== undefined) setOgTagsState(ogTags);
  }

  const handleInputChange = async (event: string) => {
    let parts = event.split(LINK_PREVIEW_REGEX);
    if (parts?.length > 0) {
      {
        parts?.map((value: string) => {
          if (LINK_PREVIEW_REGEX.test(value) && !isUploadScreen) {
            clearTimeout(debounceLinkPreviewTimeout);
            let isURL = URL_REGEX.test(value);
            if (isURL) {
              const timeoutId = setTimeout(() => {
                for (let i = 0; i < parts.length; i++) {
                  if (LINK_PREVIEW_REGEX.test(parts[i]) && !closedOnce) {
                    setShowLinkPreview(true);
                    setUrl(parts[i]);
                    detectLinkPreview(parts[i]);
                    break;
                  }
                }
              }, 500);
              setLinkPreviewDebounceTimeout(timeoutId);
            }
          }
        });
      }
    }
    if (chatRequestState === 0 || chatRequestState === null) {
      if (event.length >= MAX_LENGTH) {
        dispatch({
          type: SHOW_TOAST,
          body: {
            isToast: true,
            msg: CHARACTER_LIMIT_MESSAGE,
          },
        });
      } else if (event.length < MAX_LENGTH) {
        setMessage(event);
        setFormattedConversation(event);
      }
    } else {
      setMessage(event);
      setFormattedConversation(event);

      // chatroomType === ChatroomType.DMCHATROOM (if DM don't detect and show user tags)
      const newMentions =
        chatroomType === ChatroomType.DMCHATROOM ? [] : detectMentions(event);

      if (newMentions.length > 0) {
        const length = newMentions.length;
        setTaggedUserName(newMentions[length - 1]);
      }

      // debouncing logic
      clearTimeout(debounceTimeout);

      let len = newMentions.length;
      if (len > 0) {
        const timeoutID = setTimeout(async () => {
          setPage(1);
          const res = await taggingAPI({
            page: 1,
            searchName: newMentions[len - 1],
            chatroomId: chatroomID,
            isSecret: isSecret,
          });
          if (len > 0) {
            let groupTagsLength = res?.groupTags?.length;
            let communityMembersLength = isSecret
              ? res?.chatroomParticipants.length
              : res?.communityMembers.length;
            let arrLength = communityMembersLength + groupTagsLength;
            if (arrLength >= 5) {
              setUserTaggingListHeight(5 * 58);
            } else if (arrLength < 5) {
              let height = communityMembersLength * 58 + groupTagsLength * 80;
              setUserTaggingListHeight(height);
            }
            isSecret
              ? setUserTaggingList(res?.chatroomParticipants)
              : setUserTaggingList(res?.communityMembers);
            setGroupTags(res?.groupTags);
            setIsUserTagging(true);
          }
        }, 500);

        setDebounceTimeout(timeoutID);
      } else {
        if (isUserTagging) {
          setUserTaggingList([]);
          setGroupTags([]);
          setIsUserTagging(false);
        }
      }
    }
  };
  // this function is for editing a conversation
  const onEdit = async () => {
    let selectedConversation = editConversation;
    let conversationId = selectedConversation?.id;
    let previousConversation = selectedConversation;

    let changedConversation;
    let conversationText = replaceMentionValues(message, ({id, name}) => {
      // example ID = `user_profile/8619d45e-9c4c-4730-af8e-4099fe3dcc4b`
      let PATH = extractPathfromRouteQuery(id);
      if (!!!PATH) {
        return `<<${name}|route://${name}>>`;
      } else {
        return `<<${name}|route://${id}>>`;
      }
    });

    let editedConversation = conversationText;
    changedConversation = {
      ...selectedConversation,
      answer: editedConversation,
      isEdited: true,
    };

    dispatch({
      type: EDIT_CONVERSATION,
      body: {
        previousConversation: previousConversation,
        changedConversation: changedConversation,
      },
    });

    dispatch({
      type: SET_EDIT_MESSAGE,
      body: {
        editConversation: '',
      },
    });

    let index = conversations.findIndex((element: any) => {
      return element?.id == selectedConversation?.id;
    });

    if (index === 0) {
      dispatch({
        type: UPDATE_LAST_CONVERSATION,
        body: {
          lastConversationAnswer: editedConversation,
          chatroomType: chatroomType,
          chatroomID: chatroomID,
        },
      });
    }
    dispatch({type: SELECTED_MESSAGES, body: []});
    dispatch({type: LONG_PRESSED, body: false});
    setMessage('');
    setIsEditable(false);

    const editConversationResponse = await myClient?.editConversation({
      conversationId: conversationId,
      text: editedConversation,
    });
    await myClient?.updateConversation(
      conversationId.toString(),
      editConversationResponse?.data?.conversation,
    );
  };

  return (
    <View>
      <View
        style={[
          styles.inputContainer,
          !isUploadScreen
            ? {
                marginBottom: isKeyBoardFocused
                  ? Platform.OS === 'android'
                    ? 45
                    : 5
                  : Platform.OS === 'ios'
                  ? 20
                  : 5,
              }
            : null,
        ]}>
        <View
          style={
            (isReply && !isUploadScreen) ||
            isUserTagging ||
            isEditable ||
            Object.keys(ogTagsState).length !== 0
              ? [
                  styles.replyBoxParent,
                  {
                    borderTopWidth:
                      isReply && !isUploadScreen && !isUserTagging ? 0 : 0,
                    borderTopLeftRadius:
                      isReply && !isUploadScreen && !isUserTagging ? 10 : 20,
                    borderTopRightRadius:
                      isReply && !isUploadScreen && !isUserTagging ? 10 : 20,
                    backgroundColor: !!isUploadScreen ? 'black' : 'white',
                  },
                ]
              : null
          }>
          {userTaggingList && isUserTagging ? (
            <View
              style={[
                styles.taggableUsersBox,
                {
                  backgroundColor: !!isUploadScreen ? 'black' : 'white',
                  height: userTaggingListHeight,
                },
              ]}>
              <FlashList
                data={[...groupTags, ...userTaggingList]}
                renderItem={({item, index}: any) => {
                  let description = item?.description;
                  let imageUrl = item?.imageUrl;
                  return (
                    <Pressable
                      onPress={() => {
                        let uuid = item?.sdkClientInfo?.uuid;
                        const res = replaceLastMention(
                          message,
                          taggedUserName,
                          item?.name,
                          uuid ? `user_profile/${uuid}` : uuid,
                        );
                        setMessage(res);
                        setFormattedConversation(res);
                        setUserTaggingList([]);
                        setGroupTags([]);
                        setIsUserTagging(false);
                      }}
                      style={styles.taggableUserView}>
                      <Image
                        source={
                          !!imageUrl
                            ? {uri: imageUrl}
                            : require('../../assets/images/default_pic.png')
                        }
                        style={styles.avatar}
                      />

                      <View
                        style={[
                          styles.infoContainer,
                          {
                            borderBottomWidth: 0.2,
                            gap: Platform.OS === 'ios' ? 5 : 0,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.title,
                            {
                              color: !!isUploadScreen
                                ? STYLES.$COLORS.TERTIARY
                                : STYLES.$COLORS.PRIMARY,
                            },
                          ]}
                          numberOfLines={1}>
                          {item?.name}
                        </Text>
                        {!!description ? (
                          <Text
                            style={[
                              styles.subTitle,
                              {
                                color: !!isUploadScreen
                                  ? STYLES.$COLORS.TERTIARY
                                  : STYLES.$COLORS.PRIMARY,
                              },
                            ]}
                            numberOfLines={1}>
                            {description}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                }}
                extraData={{
                  value: [message, userTaggingList],
                }}
                estimatedItemSize={15}
                keyboardShouldPersistTaps={'handled'}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={1}
                bounces={false}
                ListFooterComponent={renderFooter}
                keyExtractor={(item: any, index) => {
                  return index?.toString();
                }}
              />
            </View>
          ) : null}

          {isReply && !isUploadScreen && (
            <View style={styles.replyBox}>
              <ReplyBox isIncluded={false} item={replyMessage} />
              <TouchableOpacity
                onPress={() => {
                  dispatch({type: SET_IS_REPLY, body: {isReply: false}});
                  dispatch({type: SET_REPLY_MESSAGE, body: {replyMessage: ''}});
                }}
                style={styles.replyBoxClose}>
                <Image
                  style={styles.replyCloseImg}
                  source={require('../../assets/images/close_icon.png')}
                />
              </TouchableOpacity>
            </View>
          )}

          {Object.keys(ogTagsState).length !== 0 && showLinkPreview ? (
            <View
              style={[
                styles.taggableUsersBox,
                {
                  backgroundColor: !!isUploadScreen ? 'black' : 'white',
                  // height: userTaggingListHeight,
                },
              ]}>
              <LinkPreviewSnap ogTags={ogTagsState} />
              <TouchableOpacity
                onPress={() => {
                  setShowLinkPreview(false);
                  setClosedOnce(true);
                }}
                style={styles.replyBoxClose}>
                <Image
                  style={styles.replyCloseImg}
                  source={require('../../assets/images/close_icon.png')}
                />
              </TouchableOpacity>
            </View>
          ) : null}

          {isEditable ? (
            <View style={styles.replyBox}>
              <ReplyBox isIncluded={false} item={editConversation} />
              <TouchableOpacity
                onPress={() => {
                  setIsEditable(false);
                  setMessage('');
                  dispatch({
                    type: SET_EDIT_MESSAGE,
                    body: {
                      editConversation: '',
                    },
                  });
                  dispatch({
                    type: SELECTED_MESSAGES,
                    body: [],
                  });
                }}
                style={styles.replyBoxClose}>
                <Image
                  style={styles.replyCloseImg}
                  source={require('../../assets/images/close_icon.png')}
                />
              </TouchableOpacity>
            </View>
          ) : null}

          <View
            style={[
              styles.textInput,
              !(isEditable || isReply) ? styles.inputBoxWithShadow : null,
              {
                backgroundColor: !!isUploadScreen
                  ? STYLES.$BACKGROUND_COLORS.DARK
                  : STYLES.$BACKGROUND_COLORS.LIGHT,
              },
              (isReply && !isUploadScreen) || isEditable || isUserTagging
                ? {
                    borderWidth: 0,
                    margin: Platform.OS === 'ios' ? 0 : 2,
                  }
                : null,
            ]}>
            {/* <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => setShowEmoji(!showEmoji)}>
              <Image
                source={require('../../assets/images/smile_emoji3x.png')}
                style={styles.emoji}
              />
            </TouchableOpacity> */}

            {!!isUploadScreen && !!!isDoc ? (
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => {
                  selectGallery();
                }}>
                <Image
                  source={require('../../assets/images/addImages3x.png')}
                  style={styles.emoji}
                />
              </TouchableOpacity>
            ) : !!isUploadScreen && !!isDoc ? (
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => {
                  selectDoc();
                }}>
                <Image
                  source={require('../../assets/images/add_more_docs3x.png')}
                  style={styles.emoji}
                />
              </TouchableOpacity>
            ) : null}

            <View
              style={[
                styles.inputParent,
                !!isUploadScreen
                  ? {
                      marginHorizontal: 5,
                    }
                  : {marginHorizontal: 20},
              ]}>
              <TaggingView
                defaultValue={message}
                onChange={handleInputChange}
                placeholder="Type here..."
                placeholderTextColor="#aaa"
                inputRef={myRef}
                maxLength={
                  chatRequestState === 0 || chatRequestState === null
                    ? MAX_LENGTH
                    : undefined
                }
                onContentSizeChange={event => {
                  setInputHeight(event.nativeEvent.contentSize.height);
                }}
                style={[
                  styles.input,
                  {height: Math.max(25, inputHeight)},
                  {
                    color: !!isUploadScreen
                      ? STYLES.$BACKGROUND_COLORS.LIGHT
                      : STYLES.$BACKGROUND_COLORS.DARK,
                  },
                ]}
                numberOfLines={6}
                onBlur={() => {
                  setIsKeyBoardFocused(false);
                }}
                onFocus={() => {
                  setIsKeyBoardFocused(true);
                }}
                partTypes={[
                  {
                    trigger: '@', // Should be a single character like '@' or '#'
                    textStyle: {
                      color: STYLES.$COLORS.LIGHT_BLUE,
                      fontFamily: STYLES.$FONT_TYPES.LIGHT,
                    }, // The mention style in the input
                  },
                ]}
              />
            </View>
            {!isUploadScreen &&
            !(chatRequestState === 0 || chatRequestState === null) &&
            !isEditable ? (
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setModalVisible(true);
                }}>
                <Image
                  source={require('../../assets/images/open_files3x.png')}
                  style={styles.emoji}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          onPressOut={() => {
            if (
              chatroomType === ChatroomType.DMCHATROOM && // if DM
              chatRequestState === null &&
              isPrivateMember // isPrivateMember = false when none of the member on both sides is CM.
            ) {
              sendDmRequest();
            } else {
              if (isEditable) {
                onEdit();
              } else {
                onSend(message);
              }
            }
          }}
          style={styles.sendButton}>
          <Image
            source={require('../../assets/images/send_button3x.png')}
            style={styles.emoji}
          />
        </TouchableOpacity>
      </View>

      {/* More features modal like select Images, Docs etc. */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <Pressable style={styles.centeredView} onPress={handleModalClose}>
          <View style={styles.modalViewParent}>
            <Pressable onPress={() => {}} style={[styles.modalView]}>
              <View style={styles.alignModalElements}>
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      handleCamera();
                    }}
                    style={styles.cameraStyle}>
                    <Image
                      source={require('../../assets/images/camera_icon3x.png')}
                      style={styles.emoji}
                    />
                  </TouchableOpacity>
                  <Text style={styles.iconText}>{CAMERA_TEXT}</Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setTimeout(() => {
                        handleGallery();
                      }, 500);
                    }}
                    style={styles.imageStyle}>
                    <Image
                      source={require('../../assets/images/select_image_icon3x.png')}
                      style={styles.emoji}
                    />
                  </TouchableOpacity>
                  <Text style={styles.iconText}>{PHOTOS_AND_VIDEOS_TEXT}</Text>
                </View>
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setTimeout(() => {
                        handleDoc();
                      }, 50);
                    }}
                    style={styles.docStyle}>
                    <Image
                      source={require('../../assets/images/select_doc_icon3x.png')}
                      style={styles.emoji}
                    />
                  </TouchableOpacity>
                  <Text style={styles.iconText}>{DOCUMENTS_TEXT}</Text>
                </View>
                {chatroomType !== 10 ? (
                  <View style={styles.iconContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate(CREATE_POLL_SCREEN, {
                          chatroomID: chatroomID,
                          conversationsLength: conversations.length * 2,
                        });
                      }}
                      style={styles.pollStyle}>
                      <Image
                        source={require('../../assets/images/poll_icon3x.png')}
                        style={styles.emoji}
                      />
                    </TouchableOpacity>
                    <Text style={styles.iconText}>{POLL_TEXT}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* SEND DM request Modal */}
      <SendDMRequestModal
        hideDMSentAlert={hideDMSentAlert}
        DMSentAlertModalVisible={DMSentAlertModalVisible}
        onSend={onSend}
        message={message}
      />
    </View>
  );
};

export default InputBox;
