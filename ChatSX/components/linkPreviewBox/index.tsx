import {View, Text, Pressable, Linking, Image} from 'react-native';
import React from 'react';
import {LinkPreviewBoxProps} from '../LinkPreview/models';
import {styles} from '../LinkPreview/styles';

export const LinkPreviewBox = ({
  description,
  title,
  image,
  url,
}: LinkPreviewBoxProps) => {
  return (
    <Pressable
      onPress={async () => {
        await Linking.openURL(url);
      }}>
      <View style={styles.linkPreviewBox}>
        <View>
          {!!image ? (
            <Image source={{uri: image}} style={styles.linkPreviewIcon} />
          ) : null}
        </View>
        <View>
          {!!title ? (
            <Text style={styles.linkPreviewTitle} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
        </View>
        <View>
          {!!description ? (
            <Text style={styles.linkPreviewMessageText} numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default LinkPreviewBox;
