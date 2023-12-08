import React, {FC, useRef} from 'react';
import {CropView} from 'react-native-image-crop-tools';
import {ImageCropScreenProps} from './models';
import {Image, Platform, Text, TouchableOpacity, View} from 'react-native';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  SELECTED_FILES_TO_UPLOAD,
  SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
  SELECTED_FILE_TO_VIEW,
} from '../../store/types/types';
import {CANCEL_BUTTON, DONE_BUTTON} from '../../constants/Strings';

const ImageCropScreen: FC<ImageCropScreenProps> = ({navigation, route}) => {
  const {selectedFilesToUpload = []}: any = useAppSelector(
    state => state.chatroom,
  );
  const dispatch = useAppDispatch();
  const cropViewRef = useRef<CropView>(null);
  const {uri, fileName} = route?.params;

  // this function is used to replace the old image with cropped image
  const replaceImage = (item: any) => {
    const selectedFiles = [...selectedFilesToUpload];
    for (let i = 0; i < selectedFiles?.length; i++) {
      if (selectedFiles[i]?.fileName === fileName) {
        selectedFiles[i] = {...selectedFiles[i], ...item};

        dispatch({
          type: SELECTED_FILE_TO_VIEW,
          body: {image: {...selectedFiles[i], ...item}},
        });
      }
    }

    dispatch({
      type: SELECTED_FILES_TO_UPLOAD,
      body: {images: [...selectedFiles]},
    });
    dispatch({
      type: SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
      body: {images: [...selectedFiles]},
    });
    navigation.goBack();
  };

  return (
    <>
      {/* Crop View */}
      {uri ? (
        <>
          <CropView
            sourceUrl={uri}
            style={styles.cropView}
            ref={cropViewRef}
            onImageCrop={res => {
              const croppedImage = {...res};
              if (Platform.OS === 'android') {
                if (!croppedImage?.uri) {
                  return;
                }
                croppedImage.uri = `file://${croppedImage?.uri}`;
              }
              replaceImage(croppedImage);
            }}
          />
        </>
      ) : null}

      {/* Bottom Tabs */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigation.goBack();
          }}>
          <Text style={styles.text}>{CANCEL_BUTTON}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            cropViewRef?.current?.rotateImage(true);
          }}>
          <Image
            source={require('../../assets/images/rotate_icon3x.png')}
            style={styles.rotateIcon}
          />
          {/* <Text>Rotate</Text> */}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            cropViewRef?.current?.saveImage(false, 100);
          }}>
          <Text style={styles.text}>{DONE_BUTTON}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ImageCropScreen;
