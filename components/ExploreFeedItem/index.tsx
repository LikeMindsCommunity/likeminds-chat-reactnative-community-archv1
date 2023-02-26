import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import STYLES from '../../constants/Styles';
import ToastMessage from '../ToastMessage';
import {styles} from './styles';

interface Props {
  avatar: string;
  header: string;
  title: string;
  lastMessage: string;
  pinned: boolean;
  isJoined: boolean;
  participants: number;
  messageCount: number;
  external_seen: number;
  isSecret: boolean
}

const ExploreFeedItem: React.FC<Props> = ({
  avatar,
  header,
  title,
  lastMessage,
  pinned = false,
  isJoined = false,
  participants,
  messageCount,
  external_seen,
  isSecret
}) => {
  const [isToast, setIsToast] = useState(false);
  const [msg, setMsg] = useState('');
  return (
    <View style={styles.itemContainer}>
      <View>
        <Image
          source={
            !!avatar
              ? {uri: avatar}
              : require('../../assets/images/default_pic.png')
          }
          style={styles.avatar}
        />
        {pinned && (
          <View style={styles.pinnedIconParent}>
            <Image
              source={require('../../assets/images/pin_icon_white3x.png')}
              style={styles.pinnedIcon}
            />
          </View>
        )}

        {(external_seen && !pinned) && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        )}
      </View>

      <View style={styles.infoParent}>
        <View style={styles.infoContainer}>
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {header}
                {isSecret ? (
              <Image
                source={require('../../assets/images/lock_icon3x.png')}
                style={styles.lockIcon}
              />
            ) : null}
              </Text>
            </View>
            <View style={styles.info}>
              <Image
                source={require('../../assets/images/participants_icon3x.png')}
                style={styles.info_icons}
              />
              <Text
                style={styles.lastMessage}
                numberOfLines={1}>{`${participants} • `}</Text>
              <Image
                source={require('../../assets/images/message_icon3x.png')}
                style={styles.info_icons}
              />
              <Text
                style={styles.lastMessage}
                numberOfLines={1}>{`${messageCount}`}</Text>
            </View>
          </View>
          {/* {pinned && <View style={styles.pinned} />} */}
          {!isJoined ? (
            <TouchableOpacity
              onPress={() => {
                setMsg('Joined successfully');
                setIsToast(true);
              }}
              style={styles.joinBtnContainer}>
              <Image
                source={require('../../assets/images/join_group3x.png')}
                style={styles.icon}
              />
              <Text style={styles.join}>{'Join'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setMsg('Leaved chatroom successfully');
                setIsToast(true);
              }}
              style={styles.joinedBtnContainer}>
              <Image
                source={require('../../assets/images/joined_group3x.png')}
                style={styles.icon}
              />
              <Text style={styles.joined}>{'Joined'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.chatroomInfo}>{title}</Text>
        </View>
      </View>
      <ToastMessage
        message={msg}
        isToast={isToast}
        onDismiss={() => {
          setIsToast(false);
        }}
      />
    </View>
  );
};

export default ExploreFeedItem;
