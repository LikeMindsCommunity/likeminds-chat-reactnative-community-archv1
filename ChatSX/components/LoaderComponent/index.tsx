import {View, Text, ActivityIndicator} from 'react-native';
import React from 'react';
import STYLES from '../../constants/Styles';

export const LoaderComponent = () => {
  return (
    <View
      style={{
        // backgroundColor: 'transparent',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        opacity: 0.5,
      }}>
      <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
    </View>
  );
};

export const LoaderChatroomComponent = () => {
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        opacity: 1,
      }}>
      <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
    </View>
  );
};

// export default LoaderComponent;
