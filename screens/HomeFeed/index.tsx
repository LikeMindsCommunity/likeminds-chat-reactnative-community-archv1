import React, {useState, useLayoutEffect, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {myClient} from '../..';
import {dummyData} from '../../assets/dummyResponse/dummyData';
import HomeFeedExplore from '../../components/HomeFeedExplore';
import HomeFeedItem from '../../components/HomeFeedItem';
import STYLES from '../../constants/Styles';
import useAPI from '../../hooks/useAPI';
import styles from './styles';

interface Props {
  navigation: any;
}

const HomeFeed = ({navigation}: Props) => {
  const [chats, setChats] = useState(dummyData.data.my_chatrooms);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <TouchableOpacity>
          <Text
            style={{
              color: STYLES.$COLORS.PRIMARY,
              fontSize: STYLES.$FONT_SIZES.XL,
              fontFamily: STYLES.$FONT_TYPES.BOLD,
            }}>
            Community
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{
            width: 35,
            height: 35,
            borderRadius: STYLES.$AVATAR.BORDER_RADIUS,
            backgroundColor: 'purple',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: STYLES.$COLORS.TERTIARY,
              fontSize: STYLES.$FONT_SIZES.XL,
              fontFamily: STYLES.$FONT_TYPES.SEMI_BOLD,
              paddingTop: 3,
            }}>
            R
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    async function fetchData() {
      let payload = {
        user_unique_id: 'ankit-sdk-55',
        user_name: 'Ankit SDK 55',
        is_guest: false,
      };
      try {
        // const res = await myClient.initSDK(payload)
        // await myClient.getHomeFeedData({communityId:'1234',page: 1});
        // console.log('res --', myClient.initSDK)
        // return res;
      } catch (error) {
        throw error
        
      }
    }
    fetchData();
  }, []);

  // let {response} = useAPI({func: myClient?.initSDK, payload});
  // console.log('res =',response);

  return (
    <View style={styles.page}>
      <FlatList
        data={chats}
        ListHeaderComponent={() => (
          <HomeFeedExplore newCount={5} navigation={navigation} />
        )}
        renderItem={({item}) => {
          const homeFeedProps = {
            title: item?.chatroom?.title!,
            avatar: item?.chatroom?.chatroom_image_url!,
            lastMessage: item?.last_conversation?.answer!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            time: item?.last_conversation?.reply_conversation_object
              ?.created_epoch!,

            unreadCount: item?.unseen_conversation_count!,
            pinned: false,
          };
          return <HomeFeedItem {...homeFeedProps} />;
        }}
        keyExtractor={item => item.chatroom.id.toString()}
      />
    </View>
  );
};

export default HomeFeed;
