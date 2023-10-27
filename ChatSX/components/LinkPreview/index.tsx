import {View, Text, Image, Linking, Pressable} from 'react-native';
import React from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {useAppSelector} from '../../../store';
import {decode} from '../../commonFuctions';
import {LinkPreviewBoxProps} from './models/LinkPreviewBoxProps';
import {LinkPreviewProps} from './models/LinkPreviewProps';

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

const LinkPreview = ({
  description,
  title,
  image,
  url,
  isTypeSent,
  isIncluded,
  item,
}: LinkPreviewProps) => {
  const {user} = useAppSelector(state => state.homefeed);

  return (
    <View
      style={[
        styles.displayRow,
        {
          justifyContent: isTypeSent ? 'flex-end' : 'flex-start',
        },
      ]}>
      <View
        style={[
          styles.linkPreview,
          isTypeSent ? styles.sentMessage : styles.receivedMessage,
          isIncluded ? {backgroundColor: STYLES.$COLORS.SELECTED_BLUE} : null,
        ]}>
        {/* Reply conversation message sender name */}
        {!!(item?.member?.id == user?.id) ? null : (
          <Text style={styles.messageInfo} numberOfLines={1}>
            {item?.member?.name}
            {!!item?.member?.customTitle ? (
              <Text
                style={
                  styles.messageCustomTitle
                }>{` • ${item?.member?.customTitle}`}</Text>
            ) : null}
          </Text>
        )}
        <LinkPreviewBox
          description={description}
          title={title}
          url={url}
          image={image}
        />
        <View>
          <View style={styles.messageText as any}>
            {decode(item?.answer, true)}
          </View>
          <View style={styles.alignTime}>
            {item?.isEdited ? (
              <Text style={styles.messageDate}>{`Edited • `}</Text>
            ) : null}
            <Text style={styles.messageDate}>{item?.createdAt}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LinkPreview;
