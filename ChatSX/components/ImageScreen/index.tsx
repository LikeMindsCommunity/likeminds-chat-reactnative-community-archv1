import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Pressable,
} from 'react-native';
import React, {useLayoutEffect} from 'react';
import Layout from '../../constants/Layout';
import STYLES from '../../constants/Styles';
import {styles} from './styles';
import VideoPlayer from 'react-native-media-console';
import {CAROUSEL_SCREEN, VIDEO_PLAYER} from '../../constants/Screens';
import {IMAGE_TEXT, VIDEO_TEXT} from '../../constants/Strings';
import ViewImage from '../../screens/ViewImage';
import {STATUS_BAR_STYLE} from '../../store/types/types';
import {useAppDispatch} from '../../store';

interface ImageScreen {
  navigation: any;
  route: any;
}

const ImageScreen = ({navigation, route}: ImageScreen) => {
  const {attachments} = route.params;
  const dispatch = useAppDispatch();

  const setInitialHeader = () => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity onPress={navigation.goBack}>
            <Image
              source={require('../../assets/images/back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          <View style={styles.chatRoomInfo}>
            <Text
              style={{
                color: STYLES.$COLORS.PRIMARY,
                fontSize: STYLES.$FONT_SIZES.LARGE,
                fontFamily: STYLES.$FONT_TYPES.BOLD,
              }}>
              {'Files'}
            </Text>
          </View>
        </View>
      ),
    });
  };

  useLayoutEffect(() => {
    setInitialHeader();
  }, []);
  return (
    <ScrollView>
      {attachments.map((val: any, index: any) => {
        return (
          <TouchableOpacity
            style={{
              marginTop: 20,
            }}
            onPress={() => {
              navigation.navigate(CAROUSEL_SCREEN, {data: attachments, index});
              dispatch({
                type: STATUS_BAR_STYLE,
                body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
              });
            }}
            key={val + index}>
            {val?.type === IMAGE_TEXT ? (
              <ViewImage val={val} />
            ) : val?.type === VIDEO_TEXT ? (
              <View>
                <Pressable
                  onPress={() => {
                    navigation.navigate(CAROUSEL_SCREEN, {
                      data: attachments,
                      index,
                    });
                    dispatch({
                      type: STATUS_BAR_STYLE,
                      body: {color: STYLES.$STATUS_BAR_STYLE['light-content']},
                    });
                  }}>
                  <Image
                    style={{
                      height: 250,
                      width: '100%',
                      resizeMode: 'contain',
                    }}
                    source={{uri: val?.thumbnailUrl}}
                  />
                  {val?.type === VIDEO_TEXT ? (
                    <View style={{position: 'absolute', bottom: 20, left: 20}}>
                      <Image
                        source={require('../../assets/images/video_icon3x.png')}
                        style={styles.videoIcon}
                      />
                    </View>
                  ) : null}
                </Pressable>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default ImageScreen;
