import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {getFullDate} from '../../commonFuctions';
import {styles} from './styles';

interface Props {
  avatar: string;
  title: string;
  lastMessage: string;
  time: number;
  pinned: boolean;
  unreadCount: number;
}

const HomeFeedItem: React.FC<Props> = ({
  avatar,
  title,
  lastMessage,
  time,
  pinned = false,
  unreadCount,
}) => {
  let dateOrTime = getFullDate(time);
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
          {lastMessage}
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
