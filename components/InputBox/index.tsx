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
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {onConversationsCreate} from '../../store/actions/chatroom';
import {
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  IS_FILE_UPLOADING,
  MESSAGE_SENT,
  SELECTED_FILES_TO_UPLOAD,
  SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
  SELECTED_FILE_TO_VIEW,
  SELECTED_MORE_FILES_TO_UPLOAD,
  SET_FILE_UPLOADING_MESSAGES,
  SET_IS_REPLY,
  SET_REPLY_MESSAGE,
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
import {createThumbnail} from 'react-native-create-thumbnail';
import PdfThumbnail from 'react-native-pdf-thumbnail';
import {
  AUDIO_TEXT,
  CHARACTER_LIMIT_MESSAGE,
  IMAGE_TEXT,
  PDF_TEXT,
  VIDEO_TEXT,
} from '../../constants/Strings';
import {CognitoIdentityCredentials, S3} from 'aws-sdk';
import AWS from 'aws-sdk';
import {BUCKET, POOL_ID, REGION} from '../../aws-exports';

interface InputBox {
  replyChatID?: any;
  chatroomID: any;
  chatRequestState?: any;
  chatroomType?: any;
  navigation: any;
  isUploadScreen: boolean;
  isPrivateMember?: boolean;
  isDoc?: boolean;
  myRef?: any;
}

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

  const MAX_FILE_SIZE = 104857600; // 100MB in bytes
  const MAX_LENGTH = 300;

  const {
    selectedFilesToUpload = [],
    selectedFilesToUploadThumbnails = [],
    conversations = [],
  }: any = useAppSelector(state => state.chatroom);
  const {myChatrooms, user, community}: any = useAppSelector(
    state => state.homefeed,
  );
  const {chatroomDetails, isReply, replyMessage}: any = useAppSelector(
    state => state.chatroom,
  );

  const dispatch = useAppDispatch();
  let conversationArrayLength = conversations.length;

  AWS.config.update({
    region: REGION, // Replace with your AWS region, e.g., 'us-east-1'
    credentials: new CognitoIdentityCredentials({
      IdentityPoolId: POOL_ID, // Replace with your Identity Pool ID
    }),
  });

  const s3 = new S3();

  // function to get thumbnails from videos
  const getAllVideosThumbnail = async (selectedImages: any) => {
    let arr: any = [];
    let dummyArrSelectedFiles: any = selectedImages;
    for (let i = 0; i < selectedImages?.length; i++) {
      if (selectedImages[i]?.type?.split('/')[0] === VIDEO_TEXT) {
        await createThumbnail({
          url: selectedImages[i].uri,
          timeStamp: 10000,
        })
          .then(response => {
            arr = [...arr, {uri: response.path}];
            dummyArrSelectedFiles[i] = {
              ...dummyArrSelectedFiles[i],
              thumbnail_url: response.path,
            };
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
    dispatch({
      type: SELECTED_FILES_TO_UPLOAD,
      body: {images: dummyArrSelectedFiles},
    });
    return arr;
  };

  // function to get thumbnails from videos
  const getVideoThumbnail = async (selectedImages: any) => {
    let arr: any = [];
    let dummyArrSelectedFiles: any = selectedImages;
    for (let i = 0; i < selectedImages?.length; i++) {
      if (selectedImages[i]?.type?.split('/')[0] === VIDEO_TEXT) {
        await createThumbnail({
          url: selectedImages[i].uri,
          timeStamp: 10000,
        })
          .then(response => {
            arr = [...arr, {uri: response.path}];
            dummyArrSelectedFiles[i] = {
              ...dummyArrSelectedFiles[i],
              thumbnail_url: response.path,
            };
          })
          .catch(err => console.log({err}));
      } else {
        arr = [...arr, {uri: selectedImages[i].uri}];
      }
    }
    dispatch({
      type: SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
      body: {images: [...selectedFilesToUploadThumbnails, ...arr]},
    });
    dispatch({
      type: SELECTED_FILES_TO_UPLOAD,
      body: {images: [...selectedFilesToUpload, ...dummyArrSelectedFiles]},
    });
    return arr;
  };

  // function to get thumbnails of all pdf
  const getAllPdfThumbnail = async (selectedImages: any) => {
    let arr: any = [];
    for (let i = 0; i < selectedImages?.length; i++) {
      const filePath = selectedImages[i].uri;
      const page = 0;
      if (selectedImages[i]?.type?.split('/')[1] === PDF_TEXT) {
        const res = await PdfThumbnail.generate(filePath, page);
        if (!!res) {
          arr = [...arr, {uri: res?.uri}];
        }
      } else {
        arr = [...arr, {uri: selectedImages[i].uri}];
      }
    }
    return arr;
  };

  // function to get thumbnails of pdf
  const getPdfThumbnail = async (selectedFile: any) => {
    let arr: any = [];
    const filePath = selectedFile.uri;
    const page = 0;
    if (selectedFile?.type?.split('/')[1] === PDF_TEXT) {
      const res = await PdfThumbnail.generate(filePath, page);
      if (!!res) {
        arr = [...arr, {uri: res?.uri}];
      }
    } else {
      arr = [...arr, {uri: selectedFile.uri}];
    }
    return arr;
  };

  //select Images and videoes From Gallery
  const selectGalley = async () => {
    const options = {
      mediaType: 'mixed',
      selectionLimit: 0,
    };
    navigation.navigate(FILE_UPLOAD, {
      chatroomID: chatroomID,
    });
    await launchImageLibrary(options as any, (response: any) => {
      console.log('Selected image: ', response);
      if (response?.didCancel) {
        navigation.goBack();
      }
      let selectedImages = response?.assets; // selectedImages can be anything images or videos or both

      for (let i = 0; i < selectedImages?.length; i++) {
        if (selectedImages[i].fileSize >= MAX_FILE_SIZE) {
          dispatch({
            type: SHOW_TOAST,
            body: {isToast: true, msg: 'Files above 100 MB is not allowed'},
          });
          navigation.goBack();
          return;
        }
      }

      if (!!selectedImages) {
        if (isUploadScreen === false) {
          getAllVideosThumbnail(selectedImages);
          dispatch({
            type: SELECTED_FILE_TO_VIEW,
            body: {image: selectedImages[0]},
          });
          dispatch({
            type: STATUS_BAR_STYLE,
            body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
          });
        } else if (isUploadScreen === true) {
          getVideoThumbnail(selectedImages);
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
      navigation.navigate(FILE_UPLOAD, {
        chatroomID: chatroomID,
      });
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        allowMultiSelection: true,
      });
      console.log('Selected DOC: ', response);
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
              thumbnail_url: allThumbnailsArr[i]?.uri,
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
            body: {image: {...selectedDocs[0], thumbnail_url: res[0]?.uri}},
          });

          //redux action to change status bar color
          dispatch({
            type: STATUS_BAR_STYLE,
            body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
          });
        } else if (isUploadScreen === true) {
          let arr: any = await getAllPdfThumbnail(selectedDocs);
          console.log('---> getAllPdfThumbnail', arr, selectedDocs);
          for (let i = 0; i < selectedDocs?.length; i++) {
            selectedDocs[i] = {...selectedDocs[i], thumbnail_url: arr[i]?.uri};
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
      navigation.goBack();
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
          } else if (
            permissionGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ) {
            console.log('Storage Permission Denied with Never Ask Again.');
            Alert.alert(
              'Storage Permission Required',
              'App needs access to your storage to read files. Please go to app settings and grant permission.',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Open Settings', onPress: Linking.openSettings},
              ],
            );
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

  const uploadResource = async (selectedImages: any, conversationID: any) => {
    if (isUploading) return;

    // start uploading
    // dispatch({
    //   type: IS_FILE_UPLOADING,
    //   body: {fileUploadingStatus: true, fileUploadingID: dummyID},
    // });

    for (let i = 0; i < selectedImages?.length; i++) {
      let attachmentType = selectedImages[i]?.type?.split('/')[0];
      let docAttachmentType = selectedImages[i]?.type?.split('/')[1];
      console.log('selectedImages[i].name ==', selectedImages[i]);
      let name =
        attachmentType === IMAGE_TEXT
          ? selectedImages[i].fileName
          : attachmentType === VIDEO_TEXT
          ? selectedImages[i].fileName
          : attachmentType === PDF_TEXT
          ? selectedImages[i].name
          : null;
      let path = `files/collabcard/${chatroomID}/conversation/${conversationID}/${name}`;
      let thumbnailUrlPath = `files/collabcard/${chatroomID}/conversation/${conversationID}/${selectedImages[i]?.thumbnail_url}`;

      const img = await fetchResourceFromURI(selectedImages[i]?.uri);

      //for video thumbnail
      const thumbnailUrlImg = await fetchResourceFromURI(
        selectedImages[i]?.thumbnail_url,
      );

      console.log('path ===', path);
      console.log('img', img);
      console.log('selectedImages[i]?.type ==', selectedImages[i]);

      const params = {
        Bucket: BUCKET,
        Key: path,
        Body: img,
        ACL: 'public-read-write',
        ContentType: selectedImages[i]?.type, // Replace with the appropriate content type for your file
      };

      //for video thumbnail
      const thumnnailUrlParams = {
        Bucket: BUCKET,
        Key: thumbnailUrlPath,
        Body: thumbnailUrlImg,
        ACL: 'public-read-write',
        ContentType: selectedImages[i]?.type, // Replace with the appropriate content type for your file
      };

      try {
        let getVideoThumbnailData = null;

        //for video thumbnail
        if (selectedImages[i]?.thumbnail_url) {
          getVideoThumbnailData = await s3.upload(thumnnailUrlParams).promise();
        }
        const data = await s3.upload(params).promise();
        console.log('File uploaded successfully:', data, getVideoThumbnailData);
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
            conversation_id: conversationID,
            files_count: selectedImages?.length,
            index: i,
            meta: {
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
            thumbnail_url:
              fileType === VIDEO_TEXT ? getVideoThumbnailData?.Location : null,
          };
          console.log('payload --->', payload);

          const uploadRes = await myClient.onUploadFile(payload as any);
          console.log('uploadRes ==', uploadRes);
          setS3UploadResponse(null);
        }
      } catch (error) {
        console.log('Error uploading file:', error);
      }

      setProgressText('');
      dispatch({
        type: CLEAR_SELECTED_FILES_TO_UPLOAD,
      });
      dispatch({
        type: CLEAR_SELECTED_FILE_TO_VIEW,
      });

      console.log('selectedImages[i].type', selectedImages[i].type);
    }

    dispatch({
      type: CLEAR_FILE_UPLOADING_MESSAGES,
      body: {
        ID: conversationID,
      },
    });

    //stopped uploading
    // dispatch({
    //   type: IS_FILE_UPLOADING,
    //   body: {fileUploadingStatus: false, fileUploadingID: null},
    // });
  };

  const handleFileUpload = async (conversationID: any) => {
    const res = await uploadResource(selectedFilesToUpload, conversationID);
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
    let attachmentsCount = selectedFilesToUpload?.length; //if any

    let dummySelectedFileArr: any = []; //if any
    let dummyAttachmentsArr: any = []; //if any

    if (attachmentsCount > 0) {
      for (let i = 0; i < attachmentsCount; i++) {
        let attachmentType = selectedFilesToUpload[i]?.type?.split('/')[0];
        let docAttachmentType = selectedFilesToUpload[i]?.type?.split('/')[1];
        if (attachmentType === IMAGE_TEXT) {
          let obj = {
            image_url: selectedFilesToUpload[i].uri,
            index: i,
          };
          dummySelectedFileArr = [...dummySelectedFileArr, obj];
        } else if (attachmentType === VIDEO_TEXT) {
          let obj = {
            video_url: selectedFilesToUpload[i].uri,
            index: i,
            thumbnail_url: selectedFilesToUpload[i].thumbanil,
          };
          dummySelectedFileArr = [...dummySelectedFileArr, obj];
        } else if (docAttachmentType === PDF_TEXT) {
          let obj = {
            pdf_file: selectedFilesToUpload[i].uri,
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
            thumbnail_url: selectedFilesToUpload[i].thumbnail_url,
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
        replyObj.images = dummySelectedFileArr;
        replyObj.videos = dummySelectedFileArr;
        replyObj.pdf = dummySelectedFileArr;
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
      obj.images = dummySelectedFileArr;
      obj.videos = dummySelectedFileArr;
      obj.pdf = dummySelectedFileArr;

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

      if (isReply) {
        dispatch({type: SET_IS_REPLY, body: {isReply: false}});
        dispatch({type: SET_REPLY_MESSAGE, body: {replyMessage: ''}});
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
            attachment_count: attachmentsCount,
            replied_conversation_id: replyMessage?.id,
          };
          let response = await dispatch(onConversationsCreate(payload) as any);

          //Handling conversation failed case
          if (response === undefined) {
            dispatch({
              type: SHOW_TOAST,
              body: {
                isToast: true,
                msg: 'Message not sent. Please check your internet connection',
              },
            });
          }
          console.log('onConversationsCreate ==', response);
        } else {
          navigation.goBack();
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
          console.log('response onConversationsCreate ==', response);
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
            // dispatch({
            //   type: IS_FILE_UPLOADING,
            //   body: {fileUploadingStatus: true, fileUploadingID: ID},
            // });

            dispatch({
              type: SET_FILE_UPLOADING_MESSAGES,
              body: {
                message: isReply
                  ? {...replyObj, id: response?.id, temporary_id: ID}
                  : {...obj, id: response?.id, temporary_id: ID},
                ID: response?.id,
              },
            });

            await handleFileUpload(response?.id);
          }
          dispatch({
            type: STATUS_BAR_STYLE,
            body: {color: STYLES.$STATUS_BAR_STYLE.default},
          });
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
        <View style={isReply && !isUploadScreen ? styles.replyBoxParent : null}>
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

          <View
            style={[
              styles.textInput,
              {
                backgroundColor: !!isUploadScreen
                  ? STYLES.$BACKGROUND_COLORS.DARK
                  : STYLES.$BACKGROUND_COLORS.LIGHT,
              },
              isReply && !isUploadScreen
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

            {!!isUploadScreen && !!!isDoc ? (
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
              <TextInput
                value={message}
                ref={myRef}
                onChangeText={e => {
                  if (chatRequestState === 0 || chatRequestState === null) {
                    if (e.length >= MAX_LENGTH) {
                      dispatch({
                        type: SHOW_TOAST,
                        body: {
                          isToast: true,
                          msg: CHARACTER_LIMIT_MESSAGE,
                        },
                      });
                    } else if (e.length < MAX_LENGTH) {
                      setMessage(e);
                    }
                  } else {
                    setMessage(e);
                  }
                }}
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
            {!isUploadScreen &&
            !(chatRequestState === 0 || chatRequestState === null) ? (
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
