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
  CLEAR_SELECTED_IMAGES_TO_UPLOAD,
  CLEAR_SELECTED_IMAGE_TO_VIEW,
  MESSAGE_SENT,
  SELECTED_IMAGES_TO_UPLOAD,
  SELECTED_IMAGE_TO_VIEW,
  SELECTED_MORE_IMAGES_TO_UPLOAD,
  SHOW_TOAST,
  UPDATE_CHAT_REQUEST_STATE,
  UPDATE_CONVERSATIONS,
} from '../../store/types/types';
import {ReplyBox} from '../ReplyConversations';
import {chatSchema} from '../../assets/chatSchema';
import {myClient} from '../..';
import {DM_REQUEST_MESSAGE, SEND_DM_REQUEST} from '../../constants/Strings';
import {launchImageLibrary} from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {useNavigation} from '@react-navigation/native';
import {IMAGE_UPLOAD} from '../../constants/Screens';
import STYLES from '../../constants/Styles';

interface InputBox {
  isReply?: boolean;
  replyChatID?: any;
  chatroomID: any;
  replyMessage?: any;
  setIsReply?: any;
  setReplyMessage?: any;
  chatRequestState?: any;
  chatroomType?: any;
  chatroomReceiverMemberState?: any;
  navigation: any;
  isUploadScreen: boolean;
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
  chatroomReceiverMemberState,
  navigation,
  isUploadScreen,
}: InputBox) => {
  const [isKeyBoardFocused, setIsKeyBoardFocused] = useState(false);
  const [message, setMessage] = useState('');
  const [inputHeight, setInputHeight] = useState(25);
  const [showEmoji, setShowEmoji] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const {selectedImagesToUpload = []} = useAppSelector(state => state.chatroom);

  const selectGalley = async () => {
    const options = {
      mediaType: 'mixed',
      selectionLimit: 0,
    };
    await launchImageLibrary(options as any, response => {
      let selectedImages: any = response?.assets;
      console.log('Selected image: ', response);
      navigation.navigate(IMAGE_UPLOAD, {
        selectedImages: response?.assets,
        chatroomID: chatroomID,
      });

      if (isUploadScreen === false) {
        dispatch({
          type: SELECTED_IMAGES_TO_UPLOAD,
          body: {images: selectedImages},
        });

        dispatch({
          type: SELECTED_IMAGE_TO_VIEW,
          body: {image: selectedImages[0]},
        });
      } else if (isUploadScreen === true) {
        console.log('isUploadScreen ==', isUploadScreen);
        dispatch({
          type: SELECTED_MORE_IMAGES_TO_UPLOAD,
          body: {images: selectedImages},
        });
      }
    });
    // ImagePicker.openPicker({
    //   multiple: true,
    // }).then(images => {
    //   console.log('Selected image: ', images);
    //   navigation.navigate(IMAGE_UPLOAD, {
    //     selectedImages: images,
    //   });
    // });
  };

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

  const dispatch = useAppDispatch();
  const {myChatrooms, user, community} = useAppSelector(
    state => state.homefeed,
  );
  const {chatroomDetails} = useAppSelector(state => state.chatroom);

  let userState = user?.state;
  // let receiverState =

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

    // check if message is empty string or not
    if (!!message.trim()) {
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
          type: CLEAR_SELECTED_IMAGES_TO_UPLOAD,
        });
        dispatch({
          type: CLEAR_SELECTED_IMAGE_TO_VIEW,
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
        userState === 4 && // if Member not CM
        chatroomReceiverMemberState === 4 // if receiver is a member not CM
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
        (userState === 1 || // if Member not CM
          chatroomReceiverMemberState === 1) // if receiver is a member not CM
      ) {
        let response = await myClient.requestDmAction({
          chatroom_id: chatroomID,
          chat_request_state: 1,
          text: message.trim(),
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
            attachment_count: selectedImagesToUpload.length,
            replied_conversation_id: replyMessage?.id,
          };
          let response = await dispatch(onConversationsCreate(payload) as any);
          let selectedFilesCount = selectedImagesToUpload.length;
          if (response) {
            for (let i = 0; i < selectedFilesCount; i++) {
              let uploadMediaPayload = {
                messageId: response?.conversation?.member_id,
                chatroomId: chatroomID,
                file: selectedImagesToUpload[i]?.uri,
                index: i,
              };
              console.log('uploadMediaPayload', uploadMediaPayload);
              const res = await myClient.uploadMedia(uploadMediaPayload);
              console.log('uploadMedia', res);
              if (res) {
                const uploadRes = await myClient.onUploadFile({
                  conversation_id: response?.id,
                  files_count: selectedFilesCount,
                  index: i,
                  name: selectedImagesToUpload[i]?.fileName,
                  type: selectedImagesToUpload[i]?.type,
                  url: res?.Location,
                });
                console.log('uploadRes ==', uploadRes);
                navigation.goBack();
              }
            }
          }
        }
      }
    }
  };

  // function calls a confirm alert which will further call onSend function onConfirm.
  const sendDmRequest = () => {
    Alert.alert(
      SEND_DM_REQUEST,
      DM_REQUEST_MESSAGE,
      [
        {
          text: 'Cancel',
          style: 'default',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            onSend();
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );
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
  return (
    <View>
      <View
        style={[
          styles.inputContainer,
          !isUploadScreen
            ? {
                marginBottom: isKeyBoardFocused
                  ? Platform.OS === 'android'
                    ? 35
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
              userState === 4 && // if Member not CM
              chatroomReceiverMemberState === 4 // if receiver is a member not CM
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
                    // handleGallery();
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
