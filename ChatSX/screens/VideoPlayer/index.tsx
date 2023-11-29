import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {useLayoutEffect, useRef} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';

const VideoPlayer = ({navigation, route}: any) => {
  const video = useRef();
  const setInitialHeader = () => {
    navigation?.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity onPress={navigation?.goBack}>
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
              {'Video'}
            </Text>
          </View>
        </View>
      ),
    });
  };

  useLayoutEffect(() => {
    setInitialHeader();
  }, []);

  const params = route?.params;
  const url = params?.url;

  return (
    <View>
      {url ? (
        <View style={styles.video}>
          <VideoPlayer
            videoRef={video}
            disableVolume={true}
            source={{uri: url}}
            videoStyle={styles.videoPlayer}
            disableBack={true}
            disableFullscreen={true}
            paused={true}
            showOnStart={true}
          />
        </View>
      ) : null}
    </View>
  );
};

export default VideoPlayer;
