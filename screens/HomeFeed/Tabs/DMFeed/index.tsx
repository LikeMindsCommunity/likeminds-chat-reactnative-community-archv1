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
  Pressable,
} from 'react-native';
import {myClient} from '../../../..';
import {getNameInitials} from '../../../../commonFuctions';
import HomeFeedExplore from '../../../../components/HomeFeedExplore';
import HomeFeedItem from '../../../../components/HomeFeedItem';
import STYLES from '../../../../constants/Styles';
import {onValue, ref} from '@firebase/database';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  getDMFeedData,
  getHomeFeedData,
  getInvites,
  initAPI,
  profileData,
  updateDMFeedData,
  updateHomeFeedData,
  updateInvites,
} from '../../../../store/actions/homefeed';
import styles from './styles';
import {SET_DM_PAGE} from '../../../../store/types/types';
import {getUniqueId} from 'react-native-device-info';
import {fetchFCMToken, requestUserPermission} from '../../../../notifications';

interface Props {
  navigation: any;
}

const DMFeed = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [FCMToken, setFCMToken] = useState('');
  const dispatch = useAppDispatch();

  const {myDMChatrooms, unseenCount, totalCount, dmPage, invitedChatrooms} =
    useAppSelector(state => state.homefeed);
  const {user, community} = useAppSelector(state => state.homefeed);
  const db = myClient.fbInstance();
  const chatrooms = [...myDMChatrooms];

  async function fetchData() {
    if (!!community?.id) {
      let payload = {
        community_id: community?.id,
        page: 1,
      };
      const res = await dispatch(getDMFeedData(payload) as any);

      if (!!res) {
        let response = await myClient.dmStatus({
          req_from: 'dm_feed',
        });
        if (!!response) {
          setShowDM(response?.show_dm);
        }
      }
    }
  }

  useLayoutEffect(() => {
    fetchData();
  }, [navigation, community]);

  useEffect(() => {
    const token = async () => {
      const isPermissionEnabled = await requestUserPermission();
      if (isPermissionEnabled) {
        let fcmToken = await fetchFCMToken();
        if (!!fcmToken) {
          setFCMToken(fcmToken);
        }
      }
    };
    token();
  }, []);

  //function calls updateDMFeedData action to update myDMChatrooms array with the new data.
  async function updateData(newPage: number) {
    let payload = {
      community_id: community?.id,
      page: newPage,
    };
    let response = await dispatch(updateDMFeedData(payload, false) as any);
    return response;
  }

  // function shows loader in between calling the API and getting the response
  const loadData = async (newPage: number) => {
    setIsLoading(true);
    setTimeout(async () => {
      const res = await updateData(newPage);
      if (!!res) {
        setIsLoading(false);
      }
    }, 1500);
  };

  //function checks the pagination logic, if it verifies the condition then call loadData
  const handleLoadMore = async () => {
    if (!isLoading) {
      if (
        myDMChatrooms?.length > 0 &&
        myDMChatrooms?.length % 10 === 0 &&
        myDMChatrooms?.length === 10 * dmPage
      ) {
        const newPage = dmPage + 1;
        dispatch({type: SET_DM_PAGE, body: newPage});
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

  useEffect(() => {
    const query = ref(db, `/community/${community?.id}`);
    return onValue(query, snapshot => {
      if (snapshot.exists()) {
        dispatch(
          getDMFeedData({community_id: community?.id, page: 1}, false) as any,
        );
        dispatch({type: SET_DM_PAGE, body: 1});
      }
    });
  }, []);

  return (
    <View style={styles.page}>
      <FlatList
        data={chatrooms}
        renderItem={({item}: any) => {
          const homeFeedProps = {
            title:
              user?.id !== item?.chatroom?.chatroom_with_user?.id
                ? item?.chatroom?.chatroom_with_user?.name
                : item?.chatroom?.member?.name!,
            avatar:
              user?.id !== item?.chatroom?.chatroom_with_user?.id
                ? item?.chatroom?.chatroom_with_user?.image_url!
                : item?.chatroom?.member?.image_url!,
            lastMessage: item?.last_conversation?.answer!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            time: item?.last_conversation_time!,
            unreadCount: item?.unseen_conversation_count!,
            pinned: false,
            lastConversation: item?.last_conversation!,
            chatroomID: item?.chatroom?.id!,
            deletedBy: item?.last_conversation?.deleted_by,
            isSecret: item?.chatroom?.is_secret,
            chatroomType: item?.chatroom?.type,
          };
          return <HomeFeedItem {...homeFeedProps} navigation={navigation} />;
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => item?.chatroom?.id.toString()}
      />
      {showDM ? (
        <Pressable
          style={({pressed}) => [{opacity: pressed ? 0.5 : 1.0}, styles.fab]}>
          <Image
            style={styles.fabImg}
            source={require('../../../../assets/images/new_message_icon3x.png')}
          />
          <Text style={styles.text}>NEW MESSAGE</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default DMFeed;
