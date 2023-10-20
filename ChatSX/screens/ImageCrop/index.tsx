import React, {useRef} from 'react';
import {CropView} from 'react-native-image-crop-tools';
import {ImageCropScreenProps} from './models';
import {Button, Image, Text, TouchableOpacity, View} from 'react-native';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../../store';
import {
  SELECTED_FILES_TO_UPLOAD,
  SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
  SELECTED_FILE_TO_VIEW,
} from '../../store/types/types';

const ImageCropScreen = ({navigation, route}: ImageCropScreenProps) => {
  const {selectedFilesToUpload = []}: any = useAppSelector(
    state => state.chatroom,
  );
  const dispatch = useAppDispatch();
  const cropViewRef = useRef<CropView>(null);
  const {uri, fileName} = route?.params;

  const replaceImage = (item: any) => {
    let selectedFiles = [...selectedFilesToUpload];
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
      {uri ? (
        <>
          <CropView
            sourceUrl={uri}
            style={{
              width: '100%',
              flex: 1,
            }}
            ref={cropViewRef}
            onImageCrop={res => {
              replaceImage(res);
            }}
          />
        </>
      ) : null}

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            navigation.goBack();
          }}>
          <Text style={styles.text}>Cancel</Text>
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
          <Text style={styles.text}>Done</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ImageCropScreen;
