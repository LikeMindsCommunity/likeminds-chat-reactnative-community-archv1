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
import {Video, ResizeMode} from 'expo-av';
import VideoPlayer from 'expo-video-player';

const ImageUpload = ({navigation, route}: any) => {
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
      <View style={styles.selectedFileToView}>
        {itemType === 'image' ? (
          <Image
            source={{uri: selectedFileToView?.uri}}
            style={styles.mainImage}
          />
        ) : itemType === 'video' ? (
          <VideoPlayer
            videoProps={{
              shouldPlay: false,
              resizeMode: ResizeMode.CONTAIN,
              source: {
                uri: selectedFileToView?.uri,
              },
              ref: video,
            }}
            style={styles.video}
            fullscreen={{
              enterFullscreen: () => {
                setInFullsreen(!inFullscreen);
                video.current.setStatusAsync({
                  shouldPlay: true,
                });
              },
              exitFullscreen: () => {
                setInFullsreen(!inFullscreen);
                video.current.setStatusAsync({
                  shouldPlay: false,
                });
              },
              inFullscreen,
            }}
          />
        ) : null}
      </View>
      <View style={styles.bottomBar}>
        <InputBox
          isUploadScreen={true}
          chatroomID={chatroomID}
          navigation={navigation}
        />
        <ScrollView
          contentContainerStyle={styles.bottomListOfImages}
          horizontal={true}
          bounces={false}>
          {selectedFilesToUpload.length > 0 &&
            selectedFilesToUpload.map((item: any, index: any) => {
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
                        selectedFileToView?.fileName === item?.fileName
                          ? 'red'
                          : 'black',
                      borderWidth: 1,
                    },
                  ]}>
                  <Image
                    source={
                      itemType === 'video'
                        ? {
                            uri:
                              'file://' +
                              selectedFilesToUploadThumbnails[index]?.uri,
                          }
                        : {uri: selectedFilesToUploadThumbnails[index]?.uri}
                    }
                    style={styles.smallImage}
                  />
                  {itemType === 'video' ? (
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

export default ImageUpload;
