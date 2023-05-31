import {View, Text, Image, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef} from 'react';
// import Carousel from 'react-native-reanimated-carousel';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import Layout from '../../constants/Layout';
import {IMAGE_TEXT, VIDEO_TEXT} from '../../constants/Strings';
import VideoPlayer from 'react-native-media-console';
import styles from './styles';
import STYLES from '../../constants/Styles';
import {STATUS_BAR_STYLE} from '../../store/types/types';
import {useAppDispatch} from '../../store';

const CarouselScreen = ({navigation, route}: any) => {
  const video = useRef<any>(null);
  const dispatch = useAppDispatch();
  const {data, index} = route.params;

  const setInitialHeader = () => {
    navigation.setOptions({
      headerShown: false,
    });
  };

  useEffect(() => {
    setInitialHeader();
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: 'black'}}>
      <View style={styles.header}>
        <View style={styles.headingContainer}>
          <TouchableOpacity
            style={{padding: 10}}
            onPress={() => {
              navigation.goBack();
              dispatch({
                type: STATUS_BAR_STYLE,
                body: {color: STYLES.$STATUS_BAR_STYLE['dark-content']},
              });
            }}>
            <Image
              source={require('../../assets/images/blue_back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          <View style={styles.chatRoomInfo}>
            <Text
              style={{
                color: STYLES.$COLORS.TERTIARY,
                fontSize: STYLES.$FONT_SIZES.LARGE,
                fontFamily: STYLES.$FONT_TYPES.BOLD,
              }}>
              {'Files'}
            </Text>
          </View>
        </View>
      </View>
      <SwiperFlatList
        data={data}
        index={index}
        renderItem={({item, index}) => {
          return (
            <View
              key={item + index}
              style={{
                flex: 1,
                justifyContent: 'center',
              }}>
              {item?.type === IMAGE_TEXT ? (
                <Image
                  style={{
                    width: Layout.window.width,
                    height: Layout.window.height - 100,
                    resizeMode: 'contain',
                  }}
                  source={{uri: item?.url}}
                />
              ) : item?.type === VIDEO_TEXT ? (
                <View style={styles.video}>
                  <VideoPlayer
                    source={{uri: item?.url}}
                    videoStyle={styles.videoPlayer}
                    videoRef={video}
                    disableVolume={true}
                    disableBack={true}
                    disableFullscreen={true}
                    paused={true}
                  />
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
};

export default CarouselScreen;
