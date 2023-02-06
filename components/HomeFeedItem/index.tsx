import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {decode, getFullDate} from '../../commonFuctions';
import {styles} from './styles';

interface Props {
  avatar: string;
  title: string;
  lastMessage: string;
  time: number;
  pinned: boolean;
  unreadCount: number;
  lastConversation: any;
}

const HomeFeedItem: React.FC<Props> = ({
  avatar,
  title,
  lastMessage,
  time,
  pinned = false,
  unreadCount,
  lastConversation,
}) => {
  let dateOrTime = getFullDate(time);

  const getFeedIcon = (val: any) => {
    if (val[0].type === 'pdf') {
      return (
        <View
          style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={require('../../assets/images/document_icon3x.png')}
            style={{
              height: 15,
              width: 15,
              resizeMode: 'contain',
              marginRight: 5,
            }}
          />
          <Text style={styles.lastMessage}>Document</Text>
        </View>
      );
    } else if (val[0].type === 'video') {
      return (
        <Image
          source={require('../../assets/images/cross_icon3x.png')}
          style={{height: 10, width: 10, resizeMode: 'contain'}}
        />
      );
    } else if (val[0].type === 'image') {
      return (
        <View
          style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          {val?.length > 1 && (
            <Text style={styles.attachment_msg}>{val?.length}</Text>
          )}
          <Image
            source={require('../../assets/images/image_icon3x.png')}
            style={{
              height: 15,
              width: 15,
              resizeMode: 'contain',
              marginRight: 5,
            }}
          />
          <Text style={styles.attachment_msg}>
            {val?.length > 1 ? 'Photos' : 'Photo'}
          </Text>
        </View>
      );
    } else {
      return;
    }
  };
  return (
    <View style={styles.itemContainer}>
      <Image source={{uri: avatar}} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>{dateOrTime}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {!!lastConversation?.has_files
            ? getFeedIcon(lastConversation?.attachments)
            : decode(lastMessage, false)}
        </Text>
      </View>
      {/* {pinned && <View style={styles.pinned} />} */}
      {unreadCount > 0 && (
        <View style={styles.unreadCountContainer}>
          <Text style={styles.unreadCount}>{unreadCount}</Text>
        </View>
      )}
    </View>
  );
};

export default HomeFeedItem;
