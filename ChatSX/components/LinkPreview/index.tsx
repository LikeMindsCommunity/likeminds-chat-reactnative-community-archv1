import {View, Text, Image, Linking, Pressable} from 'react-native';
import React from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {useAppSelector} from '../../store';
import {decode} from '../../commonFuctions';
import {LinkPreviewProps} from './models';
import LinkPreviewBox from '../linkPreviewBox';

const LinkPreview = ({
  description,
  title,
  image,
  url,
  isTypeSent,
  isIncluded,
  item,
  chatroomName,
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
        {item?.member?.id == user?.id ? null : (
          <Text style={styles.messageInfo} numberOfLines={1}>
            {item?.member?.name}
            {item?.member?.customTitle ? (
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
            {decode(
              item?.answer,
              true,
              chatroomName,
              user?.sdkClientInfo?.community,
            )}
          </View>
          <View style={styles.alignTime}>
            {item?.isEdited ? (
              <Text style={styles.messageDate}>{'Edited • '}</Text>
            ) : null}
            <Text style={styles.messageDate}>{item?.createdAt}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LinkPreview;
