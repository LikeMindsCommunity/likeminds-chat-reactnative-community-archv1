import React, {useState} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import STYLES from '../../constants/Styles';
import ToastMessage from '../ToastMessage';
import {styles} from './styles';

interface Props {
  avatar: string;
  title: string;
  lastMessage: string;
  pinned: boolean;
  isJoined: boolean;
}

const ExploreFeedItem: React.FC<Props> = ({
  avatar,
  title = 'Group',
  lastMessage,
  pinned = false,
  isJoined = false,
}) => {
  const [isToast, setIsToast] = useState(false);
  const [msg, setMsg] = useState('');
  // const toast = () => {
  //   return <ToastMessage show={true} message="How you doinsdhcskjhdgcksjhdbcskj?" />;
  // };
  return (
    <View style={styles.itemContainer}>
      <View>
        <Image source={{uri: avatar}} style={styles.avatar} />
        <View style={styles.pinnedIconParent}>
          <Image
            source={require('../../assets/images/pin_icon_white3x.png')}
            style={styles.pinnedIcon}
          />
        </View>
        {/* <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View> */}
      </View>

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
          {!isJoined ? (
            <TouchableOpacity
              onPress={() => {
                setMsg('How you doin?');
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
            <View style={styles.joinedBtnContainer}>
              <Image
                source={require('../../assets/images/joined_group3x.png')}
                style={styles.icon}
              />
              <Text style={styles.joined}>{'Joined'}</Text>
            </View>
          )}
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.chatroomInfo}>
            This space is for all the members to share problems related to skin
          </Text>
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
