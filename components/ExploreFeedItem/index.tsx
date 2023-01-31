import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {styles} from './styles';

interface Props {
  avatar: string;
  title: string;
  lastMessage: string;
  pinned: boolean;
  join: boolean;
}

const ExploreFeedItem: React.FC<Props> = ({
  avatar,
  title = 'Group',
  lastMessage,
  pinned = false,
  join,
}) => {
  return (
    <View style={styles.itemContainer}>
      <Image source={{uri: avatar}} style={styles.avatar} />
      <View style={styles.infoParent}>
        <View style={styles.infoContainer}>
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {`12 • 3`}
            </Text>
          </View>
          {/* {pinned && <View style={styles.pinned} />} */}
          <View style={styles.joinBtnContainer}>
            <Image
              source={require('../../assets/images/join_group3x.png')}
              style={styles.icon}
            />
            <Text style={styles.join}>{'Join'}</Text>
          </View>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.chatroomInfo}>
            This space is for all the members to share problems related to skin
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ExploreFeedItem;
