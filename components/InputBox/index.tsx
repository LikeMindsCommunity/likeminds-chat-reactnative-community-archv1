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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {onConversationsCreate} from '../../store/actions/chatroom';
import {
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  IS_FILE_UPLOADING,
  MESSAGE_SENT,
  SELECTED_FILES_TO_UPLOAD,
  SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
  SELECTED_FILE_TO_VIEW,
  SELECTED_MORE_FILES_TO_UPLOAD,
  SHOW_TOAST,
  STATUS_BAR_STYLE,
  UPDATE_CHAT_REQUEST_STATE,
  UPDATE_CONVERSATIONS,
} from '../../store/types/types';
import {ReplyBox} from '../ReplyConversations';
import {chatSchema} from '../../assets/chatSchema';
import {myClient} from '../..';
import {launchImageLibrary} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {FILE_UPLOAD} from '../../constants/Screens';
import STYLES from '../../constants/Styles';
import SendDMRequestModal from '../../customModals/SendDMRequest';
import {Amplify, Storage} from 'aws-amplify';
import {awsConfig} from '../../aws-exports';
import {createThumbnail} from 'react-native-create-thumbnail';

Amplify.configure(awsConfig);

interface InputBox {
  isReply?: boolean;
  replyChatID?: any;
  chatroomID: any;
  replyMessage?: any;
  setIsReply?: any;
  setReplyMessage?: any;
  chatRequestState?: any;
  chatroomType?: any;
  navigation: any;
  isUploadScreen: boolean;
  isPrivateMember?: boolean;
}

const InputBox = ({
  isReply,
  replyChatID,
  chatroomID,
  replyMessage,
  setIsReply,
  setReplyMessage,
  chatRequestState,
  chatroomType,
  navigation,
  isUploadScreen,
  isPrivateMember,
}: InputBox) => {
  const [isKeyBoardFocused, setIsKeyBoardFocused] = useState(false);
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(25);
  const [showEmoji, setShowEmoji] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [s3UploadResponse, setS3UploadResponse] = useState<any>();
  const [DMSentAlertModalVisible, setDMSentAlertModalVisible] = useState(false);

  const {selectedFilesToUpload = []}: any = useAppSelector(
    state => state.chatroom,
  );
  const {myChatrooms, user, community}: any = useAppSelector(
    state => state.homefeed,
  );
  const {chatroomDetails}: any = useAppSelector(state => state.chatroom);

  const dispatch = useAppDispatch();

  // function to get thumbnails from videoes
  const getThumbnail = async (selectedImages: any) => {
    let arr: any = [];
    for (let i = 0; i < selectedImages.length; i++) {
      if (selectedImages[i]?.type?.split('/')[0] === 'video') {
        await createThumbnail({
          url: selectedImages[i].uri,
          timeStamp: 10000,
        })
          .then(response => {
            arr = [...arr, {uri: response.path}];
          })
          .catch(err => console.log({err}));
      } else {
        arr = [...arr, {uri: selectedImages[i].uri}];
      }
    }
    dispatch({
      type: SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
      body: {images: arr},
    });
  };

  //select Images From Gallery
  const selectGalley = async () => {
    const options = {
      mediaType: 'mixed',
      selectionLimit: 0,
    };
    await launchImageLibrary(options as any, (response: any) => {
      console.log('Selected image: ', response);
      let selectedImages = response?.assets;

      if (!!selectedImages) {
        if (isUploadScreen === false) {
          getThumbnail(selectedImages);
          dispatch({
            type: SELECTED_FILES_TO_UPLOAD,
            body: {images: selectedImages},
          });
          dispatch({
            type: SELECTED_FILE_TO_VIEW,
            body: {image: selectedImages[0]},
          });
          dispatch({
            type: STATUS_BAR_STYLE,
            body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
          });

          navigation.navigate(FILE_UPLOAD, {
            chatroomID: chatroomID,
          });
        } else if (isUploadScreen === true) {
          dispatch({
            type: SELECTED_MORE_FILES_TO_UPLOAD,
            body: {images: selectedImages},
          });
        }
      }
    });
  };

  //select Documents From Gallery
  const selectDoc = async () => {
    try {
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });
      console.log('DocumentPicker pdf ', response);
    } catch (error) {
      console.log('DocumentPicker Error: ', error);
    }
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

  // function checks if we have access of storage in Android.
  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs permission to access your storage',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission granted');
          return true;
        } else {
          let permissionGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs permission to access your storage',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (permissionGranted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
          } else {
            return false;
          }
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  }

  // function handles the selection of images and videos
  const handleGallery = async () => {
    if (Platform.OS === 'ios') {
      selectGalley();
    } else {
      let res = await requestStoragePermission();
      if (res === true) {
        selectGalley();
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

  const fetchResourceFromURI = async (uri: string) => {
    const response = await fetch(uri);
    console.log(response);
    const blob = await response.blob();
    return blob;
  };

  const uploadResource = async (
    selectedImages: any,
    conversationID: any,
    dummyID: any,
  ) => {
    if (isUploading) return;

    // start uploading
    dispatch({
      type: IS_FILE_UPLOADING,
      body: {fileUploadingStatus: true, fileUploadingID: dummyID},
    });

    for (let i = 0; i < selectedImages.length; i++) {
      const img = await fetchResourceFromURI(selectedImages[i].uri);
      const res = await Storage.put(selectedImages[i].uri, img, {
        level: 'public',
        contentType: selectedImages[i]?.type,
        progressCallback(uploadProgress) {
          setProgressText(
            `Progress: ${Math.round(
              (uploadProgress.loaded / uploadProgress.total) * 100,
            )} %`,
          );
          console.log(
            `Progress: ${uploadProgress.loaded}/${uploadProgress.total}`,
          );
        },
      });
      const awsResponse = await Storage.get(res?.key);
      console.log('Storage', awsResponse);
      setProgressText('');
      dispatch({
        type: CLEAR_SELECTED_FILES_TO_UPLOAD,
      });
      dispatch({
        type: CLEAR_SELECTED_FILE_TO_VIEW,
      });

      console.log('selectedImages[i].type', selectedImages[i].type);
      let attachmentType = selectedImages[i]?.type?.split('/')[0];

      if (awsResponse) {
        let fileType = '';
        // if (selectedFilesToUpload[i].type.split('/')[1] === 'pdf') {
        //   fileType = 'pdf';
        // } else
        if (attachmentType === 'audio') {
          fileType = 'audio';
        } else if (attachmentType === 'video') {
          fileType = 'video';
        } else if (attachmentType === 'image') {
          fileType = 'image';
        }
        let payload = {
          conversation_id: conversationID,
          files_count: selectedImages.length,
          index: i,
          meta: {
            size: selectedFilesToUpload[i]?.fileSize,
          },
          name: selectedFilesToUpload[i]?.fileName,
          type: fileType,
          url: awsResponse,
        };
        console.log('payload --->', payload);

        const uploadRes = await myClient.onUploadFile(payload);
        console.log('uploadRes ==', uploadRes);
        setS3UploadResponse(null);
      }
    }

    //stopped uploading
    dispatch({
      type: IS_FILE_UPLOADING,
      body: {fileUploadingStatus: false, fileUploadingID: null},
    });
  };

  const handleFileUpload = async (conversationID: any, dummyID: any) => {
    const res = await uploadResource(
      selectedFilesToUpload,
      conversationID,
      dummyID,
    );
    return res;
  };

  const onSend = async () => {
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
    let attachmentsCount = selectedFilesToUpload.length; //if any

    let dummySelectedImageArr: any = []; //if any
    let dummyAttachmentsArr: any = []; //if any

    if (attachmentsCount > 0) {
      for (let i = 0; i < attachmentsCount; i++) {
        let attachmentType = selectedFilesToUpload[i]?.type?.split('/')[0];
        if (attachmentType === 'image') {
          let obj = {
            image_url: selectedFilesToUpload[i].uri,
            index: i,
          };
          dummySelectedImageArr = [...dummySelectedImageArr, obj];
        } else if (attachmentType === 'video') {
          let obj = {
            video_url: selectedFilesToUpload[i].uri,
            index: i,
          };
          dummySelectedImageArr = [...dummySelectedImageArr, obj];
        }
      }
    }

    if (attachmentsCount > 0) {
      for (let i = 0; i < attachmentsCount; i++) {
        let attachmentType = selectedFilesToUpload[i]?.type?.split('/')[0];
        let URI = selectedFilesToUpload[i].uri;
        if (attachmentType === 'image') {
          let obj = {
            ...selectedFilesToUpload[i],
            type: attachmentType,
            url: URI,
            index: i,
          };
          dummyAttachmentsArr = [...dummyAttachmentsArr, obj];
        } else if (attachmentType === 'video') {
          let obj = {
            ...selectedFilesToUpload[i],
            type: attachmentType,
            url: URI,
            index: i,
            name: selectedFilesToUpload[i].fileName,
          };
          dummyAttachmentsArr = [...dummyAttachmentsArr, obj];
        }
      }
    }

    // check if message is empty string or not
    if ((!!message.trim() && !isUploadScreen) || isUploadScreen) {
      let replyObj = chatSchema.reply;
      if (isReply) {
        replyObj.reply_conversation = replyMessage?.id;
        replyObj.reply_conversation_object = replyMessage;
        replyObj.member.name = user?.name;
        replyObj.member.id = user?.id;
        replyObj.answer = message.trim();
        replyObj.created_at = `${hr.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}:${min.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}`;
        replyObj.id = ID;
        replyObj.chatroom_id = chatroomDetails?.chatroom?.id;
        replyObj.community_id = community?.id;
        replyObj.date = `${
          time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
        } ${months[time.getMonth()]} ${time.getFullYear()}`;
        replyObj.id = ID;
        replyObj.chatroom_id = chatroomDetails?.chatroom?.id;
        replyObj.community_id = community?.id;
        replyObj.date = `${
          time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
        } ${months[time.getMonth()]} ${time.getFullYear()}`;
        replyObj.attachment_count = attachmentsCount;
        replyObj.attachments = dummyAttachmentsArr;
        replyObj.has_files = attachmentsCount > 0 ? true : false;
        replyObj.attachments_uploaded = attachmentsCount > 0 ? true : false;
        replyObj.images = dummySelectedImageArr;
        replyObj.videos = dummySelectedImageArr;
      }
      let obj = chatSchema.normal;
      obj.member.name = user?.name;
      obj.member.id = user?.id;
      obj.answer = message.trim();
      obj.created_at = `${hr.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}:${min.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;
      obj.id = ID;
      obj.chatroom_id = chatroomDetails?.chatroom?.id;
      obj.community_id = community?.id;
      obj.date = `${
        time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
      } ${months[time.getMonth()]} ${time.getFullYear()}`;
      obj.attachment_count = attachmentsCount;
      obj.attachments = dummyAttachmentsArr;
      obj.has_files = attachmentsCount > 0 ? true : false;
      obj.attachments_uploaded = attachmentsCount > 0 ? true : false;
      obj.images = dummySelectedImageArr;
      obj.videos = dummySelectedImageArr;
      dispatch({
        type: UPDATE_CONVERSATIONS,
        body: isReply ? {obj: {...replyObj}} : {obj: {...obj}},
      });
      dispatch({
        type: MESSAGE_SENT,
        body: isReply ? {id: replyObj?.id} : {id: obj?.id},
      });

      if (isUploadScreen) {
        dispatch({
          type: CLEAR_SELECTED_FILES_TO_UPLOAD,
        });
        dispatch({
          type: CLEAR_SELECTED_FILE_TO_VIEW,
        });
      }
      setMessage('');
      setInputHeight(25);

      if (!isUploadScreen) {
        setIsReply(false);
        setReplyMessage();
      }

      // -- Code for local message handling ended

      // condition for request DM for the first time
      if (
        chatroomType === 10 && // if DM
        chatRequestState === null &&
        isPrivateMember // isPrivateMember = false when none of the member on both sides is CM.
      ) {
        let response = await myClient.requestDmAction({
          chatroom_id: chatroomID,
          chat_request_state: 0,
          text: message.trim(),
        });

        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: 'Direct messaging request sent'},
        });

        //dispatching redux action for local handling of chatRequestState
        dispatch({
          type: UPDATE_CHAT_REQUEST_STATE,
          body: {chatRequestState: 0},
        });
      } else if (
        chatroomType === 10 && // if DM
        chatRequestState === null &&
        !isPrivateMember // isPrivateMember = false when none of the member on both sides is CM.
      ) {
        let response = await myClient.requestDmAction({
          chatroom_id: chatroomID,
          chat_request_state: 1,
          text: message.trim(),
        });
        dispatch({
          type: UPDATE_CHAT_REQUEST_STATE,
          body: {chatRequestState: 1},
        });
      } else {
        if (!isUploadScreen) {
          let payload = {
            chatroom_id: chatroomID,
            created_at: new Date(Date.now()),
            has_files: false,
            text: message.trim(),
            temporary_id: ID,
            // attachment_count?: any;
            replied_conversation_id: replyMessage?.id,
          };
          let response = await dispatch(onConversationsCreate(payload) as any);
        } else {
          let payload = {
            chatroom_id: chatroomID,
            created_at: new Date(Date.now()),
            has_files: true,
            text: message.trim(),
            temporary_id: ID,
            attachment_count: attachmentsCount,
            replied_conversation_id: replyMessage?.id,
          };
          let response = await dispatch(onConversationsCreate(payload) as any);
          dispatch({
            type: STATUS_BAR_STYLE,
            body: {color: STYLES.$STATUS_BAR_STYLE.default},
          });
          navigation.goBack();
          if (response) {
            await handleFileUpload(response?.id, ID);
          }
        }
      }
    }
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
        <View style={isReply ? styles.replyBoxParent : null}>
          {isReply && (
            <View style={styles.replyBox}>
              <ReplyBox isIncluded={false} item={replyMessage} />
              <TouchableOpacity
                onPress={() => {
                  setIsReply(false);
                  setReplyMessage();
                }}
                style={styles.replyBoxClose}>
                <Image
                  style={styles.replyCloseImg}
                  source={require('../../assets/images/close_icon.png')}
                />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[
              styles.textInput,
              {
                backgroundColor: !!isUploadScreen
                  ? STYLES.$BACKGROUND_COLORS.DARK
                  : STYLES.$BACKGROUND_COLORS.LIGHT,
              },
              isReply
                ? {
                    borderWidth: 0,
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

            {!!isUploadScreen ? (
              <TouchableOpacity
                style={styles.addMoreButton}
                onPress={() => {
                  selectGalley();
                }}>
                <Image
                  source={require('../../assets/images/addImages3x.png')}
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
              <TextInput
                value={message}
                onChangeText={setMessage}
                onContentSizeChange={event => {
                  setInputHeight(event.nativeEvent.contentSize.height);
                }}
                style={[
                  styles.input,
                  {height: Math.max(25, inputHeight)},
                  {
                    color: !!isUploadScreen
                      ? STYLES.$BACKGROUND_COLORS.LIGHT
                      : STYLES.$COLORS.SECONDARY,
                  },
                ]}
                numberOfLines={6}
                multiline={true}
                onBlur={() => {
                  setIsKeyBoardFocused(false);
                }}
                onFocus={() => {
                  setIsKeyBoardFocused(true);
                }}
                placeholder="Type a message..."
                placeholderTextColor="#aaa"
              />
            </View>
            {!isUploadScreen ? (
              <TouchableOpacity
                style={styles.emojiButton}
                onPress={() => setModalVisible(true)}>
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
              chatroomType === 10 && // if DM
              chatRequestState === null &&
              isPrivateMember // isPrivateMember = false when none of the member on both sides is CM.
            ) {
              sendDmRequest();
            } else {
              onSend();
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
                <TouchableOpacity style={styles.cameraStyle}>
                  <Image
                    source={require('../../assets/images/camera_icon3x.png')}
                    style={styles.emoji}
                  />
                </TouchableOpacity>
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
      />

      {/* {showEmoji && (
        <View style={styles.emojiPicker}>
          <Emoji name="smile" style={styles.emoji} />
          <Emoji name="satisfied" style={styles.emoji} />
          <Emoji name="joy" style={styles.emoji} />
          <Emoji name="blush" style={styles.emoji} />
          <Emoji name="heart_eyes" style={styles.emoji} />
        </View>
      )} */}
    </View>
  );
};

export default InputBox;
