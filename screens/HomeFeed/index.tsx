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
import {getNameInitials} from '../../commonFuctions';
import HomeFeedExplore from '../../components/HomeFeedExplore';
import HomeFeedItem from '../../components/HomeFeedItem';
import STYLES from '../../constants/Styles';
import {onValue, ref} from '@firebase/database';
import {AppDispatch, useAppDispatch, useAppSelector} from '../../store';
import {
  getHomeFeedData,
  getInvites,
  initAPI,
  profileData,
  updateHomeFeedData,
  updateInvites,
} from '../../store/actions/homefeed';
import styles from './styles';
import {SET_PAGE} from '../../store/types/types';
import {getUniqueId} from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';
// import {onValue, ref} from 'firebase/database';

interface Props {
  navigation: any;
}

const HomeFeed = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [communityId, setCommunityId] = useState('');
  const [invitePage, setInvitePage] = useState(1);
  const [FCMToken, setFCMToken] = useState('');
  const dispatch = useAppDispatch();
  const {myChatrooms, unseenCount, totalCount, page, invitedChatrooms} =
    useAppSelector(state => state.homefeed);
  const user = useAppSelector(state => state.homefeed.user);
  const db = myClient.fbInstance();
  const chatrooms = [...invitedChatrooms, ...myChatrooms];
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
            backgroundColor: !!user?.image_url ? 'white' : 'purple',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
            paddingTop: Platform.OS === 'ios' ? 5 : 3,
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

  const pushAPI = async (token: any) => {
    const deviceID = await getUniqueId();
    console.log('getDeviceId()', await getUniqueId());
    try {
      const response = await fetch(
        'https://betaauth.likeminds.community/user/device/push',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-device-id': `${deviceID}`,
            'x-platform-code': 'rn',
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            token: FCMToken,
          }),
        },
      );
      let res = await response.json();
      console.log('res pushAPI ==', res);
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

  async function fetchData() {
    let payload = {
      // user_unique_id: '',
      // user_name: '',
      // is_guest: false,
      // user_unique_id: '53208f29-5d15-473e-ab70-5fd77605be0f',
      // user_name: 'Ankit Garg SDK',
      user_unique_id: '0992885d-a170-494b-80c5-ecaef0cb2a24',
      user_name: 'Ankit',
      is_guest: false,
    };
    let res = await dispatch(initAPI(payload) as any);
    // let res1 = await myClient.inviteAction({
    //   channel_id: `27908`,
    //   invite_status: 2,
    // });
    // console.log('res11 =',res);

    if (!!res) {
      await dispatch(
        profileData({
          community_id: res?.community?.id,
          member_id: res?.user?.id,
        }) as any,
      );
      setCommunityId(res.community.id);
      const invitesRes = await dispatch(
        getInvites({channel_type: 1, page: 1, page_size: 10}, true) as any,
      );

      if (!!invitesRes?.user_invites) {
        if (invitesRes?.user_invites?.length < 10) {
          let payload = {
            page: 1,
          };
          await dispatch(getHomeFeedData(payload) as any);
        } else {
          await dispatch(
            updateInvites(
              {channel_type: 1, page: 2, page_size: 10},
              true,
            ) as any,
          );
          setInvitePage(invitePage => {
            return invitePage + 1;
          });
        }
      }
      pushAPI(res?.access_token);
    }

    return res;
  }

  useLayoutEffect(() => {
    fetchData();
  }, [navigation]);

  useEffect(() => {
    const token = async () => {
      let fcmToken = await messaging().getToken();
      if (!!fcmToken) {
        console.log('fcmToken ==', fcmToken);
        setFCMToken(fcmToken);
      }
    };
    token();
  }, []);

  useEffect(() => {
    if (!!user) {
      setOptions();
    }
  }, [user]);

  async function updateData(newPage: number) {
    let payload = {
      page: newPage,
    };
    let response = await dispatch(updateHomeFeedData(payload, false) as any);
    return response;
  }

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    setTimeout(async () => {
      const res = await updateData(newPage);
      if (!!res) {
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleLoadMore = async () => {
    if (!isLoading) {
      if (myChatrooms?.length === 0 && invitedChatrooms === 10 * invitePage) {
        setIsLoading(true);
        await dispatch(
          updateInvites(
            {channel_type: 1, page: invitePage + 1, page_size: 10},
            true,
          ) as any,
        );
        setInvitePage(invitePage => {
          return invitePage + 1;
        });
        setIsLoading(false);
      } else if (myChatrooms?.length > 0 && myChatrooms?.length % 10 === 0) {
        const newPage = page + 1;
        dispatch({type: SET_PAGE, body: newPage});
        loadData(newPage);
      }
      // if (myChatrooms?.length > 0 && myChatrooms?.length % 10 === 0) {
      //   const newPage = page + 1;
      //   dispatch({type: SET_PAGE, body: newPage});
      //   loadData(newPage);
      // }
    }
  };

  const renderFooter = () => {
    return isLoading ? (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
      </View>
    ) : null;
  };

  useEffect(() => {
    const query = ref(db, `/community/${communityId}`);
    return onValue(query, snapshot => {
      if (snapshot.exists()) {
        dispatch(getHomeFeedData({page: 1}, false) as any);
      }
    });
  }, []);

  return (
    <View style={styles.page}>
      {chatrooms?.length > 0 && (
        <FlatList
          data={chatrooms}
          ListHeaderComponent={() => (
            <HomeFeedExplore
              newCount={unseenCount}
              totalCount={totalCount}
              navigation={navigation}
            />
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
              deletedBy: item?.last_conversation?.deleted_by,
              inviteReceiver: item?.invite_receiver,
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
