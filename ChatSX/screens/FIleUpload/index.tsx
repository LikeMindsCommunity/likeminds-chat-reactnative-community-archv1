import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  BackHandler,
} from 'react-native';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import styles from './styles';
import Layout from '../../constants/Layout';
import InputBox from '../../components/InputBox';
import {
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  SELECTED_FILE_TO_VIEW,
  SET_FILE_UPLOADING_MESSAGES,
  STATUS_BAR_STYLE,
} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../../store';
import STYLES from '../../constants/Styles';
import VideoPlayer from 'react-native-media-console';
import {
  AUDIO_TEXT,
  FAILED,
  IMAGE_TEXT,
  PDF_TEXT,
  SUCCESS,
  VIDEO_TEXT,
} from '../../constants/Strings';
import {CognitoIdentityCredentials, S3} from 'aws-sdk';
import AWS from 'aws-sdk';
import {BUCKET, POOL_ID, REGION} from '../../aws-exports';
import {fetchResourceFromURI} from '../../commonFuctions';
import {myClient} from '../../..';

interface UploadResource {
  selectedImages: any;
  conversationID: any;
  chatroomID: any;
  selectedFilesToUpload: any;
  uploadingFilesMessages: any;
  isRetry: boolean;
}

const FileUpload = ({navigation, route}: any) => {
  const video = useRef<any>(null);
  const [status, setStatus] = React.useState({positionMillis: 0});
  const [inFullscreen, setInFullsreen] = useState(false);
  const {chatroomID, previousMessage = ''} = route?.params;
  const {
    selectedFilesToUpload = [],
    selectedFileToView = {},
    selectedFilesToUploadThumbnails = [],
  }: any = useAppSelector(state => state.chatroom);
  const {uploadingFilesMessages}: any = useAppSelector(state => state.upload);

  const itemType = selectedFileToView?.type?.split('/')[0];
  const docItemType = selectedFileToView?.type?.split('/')[1];
  let len = selectedFilesToUpload.length;
  const dispatch = useAppDispatch();

  // Selected header of chatroom screen
  const setInitialHeader = () => {
    navigation.setOptions({
      headerShown: false,
    });
  };

  // this useLayoutEffect sets Headers before other printing UI Layout
  useLayoutEffect(() => {
    setInitialHeader();
  }, [navigation]);

  useEffect(() => {
    function backActionCall() {
      dispatch({
        type: CLEAR_SELECTED_FILES_TO_UPLOAD,
      });
      dispatch({
        type: CLEAR_SELECTED_FILE_TO_VIEW,
      });
      dispatch({
        type: STATUS_BAR_STYLE,
        body: {color: STYLES.$STATUS_BAR_STYLE.default},
      });
      navigation.goBack();
      return true;
    }

    const backHandlerAndroid = BackHandler.addEventListener(
      'hardwareBackPress',
      backActionCall,
    );

    return () => backHandlerAndroid.remove();
  }, []);

  AWS.config.update({
    region: REGION, // Replace with your AWS region, e.g., 'us-east-1'
    credentials: new CognitoIdentityCredentials({
      IdentityPoolId: POOL_ID, // Replace with your Identity Pool ID
    }),
  });

  const uploadResource = async ({
    selectedImages,
    conversationID,
    chatroomID,
    selectedFilesToUpload,
    uploadingFilesMessages,
    isRetry,
  }: UploadResource) => {
    const s3 = new S3();

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

      const img = await fetchResourceFromURI(item?.uri);

      //for video thumbnail
      let thumbnailUrlImg = null;
      if (thumbnailURL && attachmentType === VIDEO_TEXT) {
        thumbnailUrlImg = await fetchResourceFromURI(thumbnailURL);
      }

      const params = {
        Bucket: BUCKET,
        Key: path,
        Body: img,
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
            index: i,
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
              ...uploadingFilesMessages[conversationID.toString()],
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
    const res = await uploadResource({
      selectedImages: selectedFilesToUpload,
      conversationID: conversationID,
      chatroomID: chatroomID,
      selectedFilesToUpload,
      uploadingFilesMessages,
      isRetry: isRetry,
    });
    return res;
  };

  return (
    <View style={styles.page}>
      {len > 0 ? (
        <View style={styles.headingContainer}>
          <TouchableOpacity
            style={styles.touchableBackButton}
            onPress={() => {
              dispatch({
                type: CLEAR_SELECTED_FILES_TO_UPLOAD,
              });
              dispatch({
                type: CLEAR_SELECTED_FILE_TO_VIEW,
              });
              dispatch({
                type: STATUS_BAR_STYLE,
                body: {color: STYLES.$STATUS_BAR_STYLE.default},
              });
              navigation.goBack();
            }}>
            <Image
              source={require('../../assets/images/blue_back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
        </View>
      ) : null}
      <View style={styles.selectedFileToView}>
        {itemType === IMAGE_TEXT ? (
          <Image
            source={{uri: selectedFileToView?.uri}}
            style={styles.mainImage}
          />
        ) : itemType === VIDEO_TEXT ? (
          <View style={styles.video}>
            <VideoPlayer
              source={{uri: selectedFileToView?.uri}}
              videoStyle={styles.videoPlayer}
              videoRef={video}
              disableBack={true}
              disableVolume={true}
              disableFullscreen={true}
              paused={true}
              showOnStart={true}
            />
          </View>
        ) : docItemType === PDF_TEXT ? (
          <Image
            source={{uri: selectedFileToView?.thumbnail_url}}
            style={styles.mainImage}
          />
        ) : null}
      </View>

      <View style={styles.bottomBar}>
        {len > 0 ? (
          <InputBox
            isUploadScreen={true}
            isDoc={docItemType === PDF_TEXT ? true : false}
            chatroomID={chatroomID}
            navigation={navigation}
            previousMessage={previousMessage}
            handleFileUpload={handleFileUpload}
          />
        ) : null}

        <ScrollView
          contentContainerStyle={styles.bottomListOfImages}
          horizontal={true}
          bounces={false}>
          {len > 0 &&
            selectedFilesToUpload.map((item: any, index: any) => {
              let fileType = item?.type?.split('/')[0];
              return (
                <Pressable
                  key={item?.uri + index}
                  onPress={() => {
                    dispatch({
                      type: SELECTED_FILE_TO_VIEW,
                      body: {image: item},
                    });
                  }}
                  style={({pressed}) => [
                    {opacity: pressed ? 0.5 : 1.0},
                    styles.imageItem,
                    {
                      borderColor:
                        docItemType === PDF_TEXT
                          ? selectedFileToView?.name === item?.name
                            ? 'red'
                            : 'black'
                          : selectedFileToView?.fileName === item?.fileName
                          ? 'red'
                          : 'black',
                      borderWidth: 1,
                    },
                  ]}>
                  <Image
                    source={
                      itemType === VIDEO_TEXT
                        ? {
                            uri:
                              'file://' +
                              selectedFilesToUploadThumbnails[index]?.uri,
                          }
                        : {uri: selectedFilesToUploadThumbnails[index]?.uri}
                    }
                    style={styles.smallImage}
                  />
                  {fileType === VIDEO_TEXT ? (
                    <View style={{position: 'absolute', bottom: 0, left: 5}}>
                      <Image
                        source={require('../../assets/images/video_icon3x.png')}
                        style={styles.videoIcon}
                      />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
        </ScrollView>
      </View>
    </View>
  );
};

export default FileUpload;
