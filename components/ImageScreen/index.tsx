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
import {VIDEO_PLAYER} from '../../constants/Screens';
import {IMAGE_TEXT, VIDEO_TEXT} from '../../constants/Strings';

interface ImageScreen {
  navigation: any;
  route: any;
}

const ImageScreen = ({navigation, route}: ImageScreen) => {
  const {attachments} = route.params;
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
              {'Images'}
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
              Linking.openURL(val?.url);
            }}
            key={val + index}>
            {val?.type === IMAGE_TEXT ? (
              <Image
                style={{
                  height: 250,
                  width: '100%',
                  resizeMode: 'contain',
                }}
                source={{uri: val?.url}}
              />
            ) : val?.type === 'video' ? (
              <View>
                <Pressable
                  onPress={() => {
                    Linking.openURL(val?.url);
                  }}>
                  <Image
                    style={{
                      height: 250,
                      width: '100%',
                      resizeMode: 'contain',
                    }}
                    source={{uri: val?.thumbnail_url}}
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
