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
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  SELECTED_FILE_TO_VIEW,
  STATUS_BAR_STYLE,
} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../store';
import STYLES from '../../constants/Styles';
import VideoPlayer from 'react-native-media-console';
import {IMAGE_TEXT, PDF_TEXT, VIDEO_TEXT} from '../../constants/Strings';

const FileUpload = ({navigation, route}: any) => {
  const video = useRef<any>(null);
  const [status, setStatus] = React.useState({positionMillis: 0});
  const [inFullscreen, setInFullsreen] = useState(false);
  const {chatroomID} = route?.params;
  const {
    selectedFilesToUpload = [],
    selectedFileToView = {},
    selectedFilesToUploadThumbnails = [],
  }: any = useAppSelector(state => state.chatroom);
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
              disableFullscreen={true}
              paused={true}
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
          />
        ) : null}

        <ScrollView
          contentContainerStyle={styles.bottomListOfImages}
          horizontal={true}
          bounces={false}>
          {len > 0 &&
            selectedFilesToUpload.map((item: any, index: any) => {
              let fileType = item?.type.split('/')[0];
              return (
                <Pressable
                  key={item?.uri + index}
                  onPress={() => {
                    console.log('item ==', item);
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
