import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useLayoutEffect, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {myClient} from '../..';
import {dummyData} from '../../assets/dummyResponse/dummyData';
import {getNameInitials} from '../../commonFuctions';
import HomeFeedExplore from '../../components/HomeFeedExplore';
import HomeFeedItem from '../../components/HomeFeedItem';
import STYLES from '../../constants/Styles';
// import { app, firebase } from '../../firebase';
// import { getDatabase, onValue, ref } from "firebase/database";
import useAPI from '../../hooks/useAPI';
import {AppDispatch, useAppDispatch, useAppSelector} from '../../store';
import {
  getHomeFeedData,
  initAPI,
  updateHomeFeedData,
} from '../../store/actions/homefeed';
import styles from './styles';
// import {onValue, ref} from 'firebase/database';

interface Props {
  navigation: any;
}

const HomeFeed = ({navigation}: Props) => {
  const [chats, setChats] = useState(dummyData.my_chatrooms);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const myChatrooms = useAppSelector(state => state.homefeed.myChatrooms);
  const user = useAppSelector(state => state.homefeed.user);

  const setOptions = () => {
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
            padding: 5,
          }}>
          {!!user?.image_url ? (
            <Image source={{uri: user?.image_url}} style={styles.avatar} />
          ) : (
            <Text
              style={{
                color: STYLES.$COLORS.TERTIARY,
                fontSize: STYLES.$FONT_SIZES.XL,
                fontFamily: STYLES.$FONT_TYPES.SEMI_BOLD,
                paddingTop:
                  Platform.OS === 'ios' ? 3 : Platform.OS === 'android' ? 0 : 0,
              }}>
              {!!user?.name ? getNameInitials(user?.name) : ''}
            </Text>
          )}
        </TouchableOpacity>
      ),
    });
  };

  async function fetchData() {
    let payload = {
      // user_unique_id: '780cfe5e-1605-49ee-b8a0-c79deaaf77bf',
      user_unique_id: '53208f29-5d15-473e-ab70-5fd77605be0f',
      user_name: 'Ankit Garg SDK',
      // user_name: '',
      is_guest: false,
    };
    let res = await dispatch(initAPI(payload) as any);
    if (!!res) {
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
        // communityId: '50421',
        page: 1,
      };
      // let response = await myClient.getHomeFeedData(payload);
      // console.log('getHomeFeedData API -=', response);
      let response = await dispatch(getHomeFeedData(payload) as any);
      // let response = await myClient.getChatroom({chatroom_id: 28552})
      //   let response = await myClient.leaveChatroom({
      //     collabcard_id: 27845,
      //     member_id: 86975,
      //     value: false,
      // })
      // let response = await myClient.fetchFeedData({
      //   community_id: 50421,
      //   order_type: 0,
      //   page: 10,
      // });
      // setTimeout(() => {
      //   console.log('timeout API -=', response);
      // }, 6000);

      // let response = await myClient.allMembers({
      //   community_id: 50421,
      //   page: 1,
      //   chatroom_id: 69285,
      //   // member_state?: number,
      // });

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
      // console.log('profileData API -=', response);
    }

    return res;
  }

  useLayoutEffect(() => {
    fetchData();
  }, [navigation]);

  useEffect(() => {
    if (!!user) {
      setOptions();
    }
  }, [user]);

  async function updateData(newPage: number) {
    let payload = {
      page: newPage,
    };
    let response = await dispatch(updateHomeFeedData(payload) as any);
    return response;
  }

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    // Alert.alert(`page ${page}`);
    // Alert.alert(`${myChatrooms.length % 10}`);
    setTimeout(async () => {
      const res = await updateData(newPage);
      if (!!res) {
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleLoadMore = () => {
    if (!isLoading) {
      if (myChatrooms.length > 0 && myChatrooms.length % 10 === 0) {
        const newPage = page + 1;
        setPage(newPage);
        loadData(newPage);
      }
    }
  };

  const renderFooter = () => {
    return isLoading ? (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
      </View>
    ) : null;
  };

  // useEffect(() => {
  //   fetchData();
  // }, []);

  // let db = myClient.fbInstance()

  // useEffect(() => {
  //   const query = ref(db, "collabcards");
  //   return onValue(query, (snapshot) => {
  //     if (snapshot.exists()) {
  //       console.log('snpashot',snapshot.val());
  //       // loadHomeFeed(1).then((res) => {
  //       //   if (res[0].chatroom.id === dmContext.currentChatroom.id) {
  //       //     getChatroomConversations(getCurrentChatroomID(), 500, dmContext);
  //       //   }
  //       // });
  //     }
  //   });
  // }, []);

  // let db = myClient.fbInstance();

  // console.log('firebase',db);
  // useEffect(() => {
  //   const query = ref(db as any, "collabcards");
  //   return onValue(query, (snapshot) => {
  //     if (snapshot.exists()) {
  //       console.log('firebase',snapshot.val());
  //       // loadHomeFeed(1).then((res) => {
  //       //   if (res[0].chatroom.id === dmContext.currentChatroom.id) {
  //       //     getChatroomConversations(getCurrentChatroomID(), 500, dmContext);
  //       //   }
  //       // });
  //     }
  //   });
  // }, []);

  // let {response} = useAPI({func: myClient?.initSDK, payload});
  // console.log('res =',response);

  return (
    <View style={styles.page}>
      {chats?.length > 0 && (
        <FlatList
          data={myChatrooms}
          // data={chats}
          ListHeaderComponent={() => (
            <HomeFeedExplore newCount={5} navigation={navigation} />
          )}
          renderItem={({item}: any) => {
            const homeFeedProps = {
              title: item?.chatroom?.header!,
              avatar: item?.chatroom?.chatroom_image_url!,
              lastMessage: item?.last_conversation?.answer!,
              lastMessageUser: item?.last_conversation?.member?.name!,
              time: item?.last_conversation_time!,
              unreadCount: item?.unseen_conversation_count!,
              pinned: false,
              lastConversation: item?.last_conversation!,
              lastConvoMember: item?.last_conversation?.member?.name!,
              chatroomID: item?.chatroom?.id!,
              isSecret: item?.chatroom?.is_secret,
            };
            return <HomeFeedItem {...homeFeedProps} navigation={navigation} />;
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          keyExtractor={(item: any) => item?.chatroom?.id.toString()}
        />
      )}
    </View>
  );
};

export default HomeFeed;
