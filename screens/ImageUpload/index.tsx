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
import React, {useEffect, useLayoutEffect, useState} from 'react';
import styles from './styles';
import Layout from '../../constants/Layout';
import InputBox from '../../components/InputBox';
import {
  CLEAR_SELECTED_IMAGES_TO_UPLOAD,
  CLEAR_SELECTED_IMAGE_TO_VIEW,
  SELECTED_IMAGE_TO_VIEW,
  STATUS_BAR_STYLE,
} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../store';
import STYLES from '../../constants/Styles';

const ImageUpload = ({navigation, route}: any) => {
  const {chatroomID} = route?.params;
  const {selectedImagesToUpload = [], selectedImageToView = {}}: any =
    useAppSelector(state => state.chatroom);
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
        type: CLEAR_SELECTED_IMAGES_TO_UPLOAD,
      });
      dispatch({
        type: CLEAR_SELECTED_IMAGE_TO_VIEW,
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
              type: CLEAR_SELECTED_IMAGES_TO_UPLOAD,
            });
            dispatch({
              type: CLEAR_SELECTED_IMAGE_TO_VIEW,
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
      <View style={styles.selectedImageToView}>
        <Image
          source={{uri: selectedImageToView?.uri}}
          style={styles.mainImage}
        />
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
          {selectedImagesToUpload.length > 0 &&
            selectedImagesToUpload.map((item: any, index: any) => {
              return (
                <Pressable
                  key={item?.uri + index}
                  onPress={() => {
                    dispatch({
                      type: SELECTED_IMAGE_TO_VIEW,
                      body: {image: item},
                    });
                  }}
                  style={({pressed}) => [
                    {opacity: pressed ? 0.5 : 1.0},
                    styles.imageItem,
                    {
                      borderColor:
                        selectedImageToView?.fileName === item?.fileName
                          ? 'red'
                          : 'black',
                      borderWidth: 1,
                    },
                  ]}>
                  <Image source={{uri: item?.uri}} style={styles.smallImage} />
                </Pressable>
              );
            })}
        </ScrollView>
      </View>
    </View>
  );
};

export default ImageUpload;
