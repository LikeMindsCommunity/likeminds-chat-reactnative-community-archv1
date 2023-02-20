import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useLayoutEffect, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, Platform} from 'react-native';
import {useDispatch} from 'react-redux';
import {myClient} from '../..';
import {dummyData} from '../../assets/dummyResponse/dummyData';
import HomeFeedExplore from '../../components/HomeFeedExplore';
import HomeFeedItem from '../../components/HomeFeedItem';
import STYLES from '../../constants/Styles';
import useAPI from '../../hooks/useAPI';
import {AppDispatch, useAppDispatch, useAppSelector} from '../../store';
import {getHomeFeedData} from '../../store/actions/homefeed';
import styles from './styles';

interface Props {
  navigation: any;
}

const HomeFeed = ({navigation}: Props) => {
  const [chats, setChats] = useState(dummyData.my_chatrooms);
  const dispatch = useAppDispatch();
  const myChatrooms = useAppSelector(state => state.homefeed.myChatrooms);

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
            padding: 5
          }}>
          <Text
            style={{
              color: STYLES.$COLORS.TERTIARY,
              fontSize: STYLES.$FONT_SIZES.XL,
              fontFamily: STYLES.$FONT_TYPES.SEMI_BOLD,
              paddingTop: Platform.OS === 'ios' ?  3 : Platform.OS === 'android' ? 0 : 0
            }}>
            R
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    async function fetchData() {
      try {
        let payload = {
          user_unique_id: '780cfe5e-1605-49ee-b8a0-c79deaaf77bf',
          user_name: '',
          is_guest: false,
        };
        let res = await myClient.initSDK(payload);
        // console.log('Initiate API -=', res);
        if (res) {
          // const value = await AsyncStorage.getAllKeys();
          // for (let i = 0; i < value.length; i++) {
          //   let output = await AsyncStorage.getItem(value[i]);
          //   console.log(`AsyncStorage key ${i}`, output);
          // }

          // let response = await myClient.getHomeFeedData({
          //   communityId: '50421',
          //   page: 1,
          // });
          let payload = {
            communityId: '50421',
            page: 1,
          };
          let response = await dispatch(getHomeFeedData(payload) as any);

          // let response = await myClient.getChatroom({chatroom_id: 69285})
          // let response = await myClient.getConversations({chatroomID: 69285, page:1000})
          //   let response = await myClient.onConversationsCreate({
          //     chatroom_id: 69285,
          //     created_at: new Date(Date.now()),
          //     has_files: false,
          //     text: 'Just testing the flow2',
          //     // attachment_count?: any;
          //     // replied_conversation_id?: string | number;
          // })
          // let response = await myClient.conversationsFetch({
          //   chatroom_id: 21130,
          //   conversation_id: 244986,
          // });

          // let pl = {community_id: 50421, member_id: 87040};
          // let response = await myClient.profileData(pl);
          console.log('profileData API -=', response);
        }

        return res;
      } catch (error) {
        // console.log('Yes Err!', error);
      }
    }
    fetchData();
  }, []);

  // let {response} = useAPI({func: myClient?.initSDK, payload});
  // console.log('res =',response);

  return (
    <View style={styles.page}>
      <FlatList
        data={myChatrooms}
        // data={chats}
        ListHeaderComponent={() => (
          <HomeFeedExplore newCount={5} navigation={navigation} />
        )}
        renderItem={({item}) => {
          const homeFeedProps = {
            title: item?.chatroom?.title!,
            avatar: item?.chatroom?.image_url_round!,
            lastMessage: item?.last_conversation?.answer!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            time: item?.last_conversation_time!,
            unreadCount: item?.unseen_conversation_count!,
            pinned: false,
            lastConversation: item?.last_conversation,
            chatroomID:  item?.chatroom?.id!,
          };
          return <HomeFeedItem {...homeFeedProps} navigation={navigation} />;
        }}
        keyExtractor={item => item.chatroom.id.toString()}
      />
    </View>
  );
};

export default HomeFeed;
