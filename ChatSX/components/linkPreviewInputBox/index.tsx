import {View, Text, Image} from 'react-native';
import React from 'react';
import {styles} from '../InputBox/styles';
import {LinkPreviewInputBoxProps} from './models';

export const LinkPreviewInputBox = ({ogTags}: LinkPreviewInputBoxProps) => {
  return (
    <View style={styles.linkPreviewBox}>
      <View style={styles.linkPreviewImageView}>
        {ogTags?.image ? (
          <Image source={{uri: ogTags?.image}} style={styles.linkPreviewIcon} />
        ) : (
          <Image
            source={require('../../assets/images/defaultLinkPreview.png')}
            style={styles.linkPreviewIcon}
          />
        )}
      </View>
      <View style={styles.linkPreviewTextView}>
        <View>
          <Text style={styles.linkPreviewTitle} numberOfLines={2}>
            {ogTags?.title}
          </Text>
        </View>
        <View style={styles.alignRow}>
          <Text style={styles.linkPreviewMessageText} numberOfLines={1}>
            {ogTags?.description}
          </Text>
        </View>
        <View style={styles.alignRow}>
          <Text style={styles.linkPreviewMessageText} numberOfLines={1}>
            {ogTags?.url?.toLowerCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LinkPreviewInputBox;
