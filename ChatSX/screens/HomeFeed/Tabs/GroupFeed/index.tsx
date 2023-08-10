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
import {myClient} from '../../../../..';
import {getNameInitials} from '../../../../commonFuctions';
import HomeFeedExplore from '../../../../components/HomeFeedExplore';
import HomeFeedItem from '../../../../components/HomeFeedItem';
import STYLES from '../../../../constants/Styles';
import {onValue, ref} from '@firebase/database';
import {useAppDispatch, useAppSelector} from '../../../../../store';
import {
  getHomeFeedData,
  getInvites,
  updateHomeFeedData,
  updateInvites,
} from '../../../../store/actions/homefeed';
import styles from './styles';
import {SET_PAGE} from '../../../../store/types/types';
import {getUniqueId} from 'react-native-device-info';
import {fetchFCMToken, requestUserPermission} from '../../../../notifications';
import {FlashList} from '@shopify/flash-list';

interface Props {
  navigation: any;
}

const GroupFeed = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitePage, setInvitePage] = useState(1);
  const [FCMToken, setFCMToken] = useState('');
  const dispatch = useAppDispatch();

  const {
    myChatrooms,
    unseenCount,
    totalCount,
    page,
    invitedChatrooms,
    community,
  } = useAppSelector(state => state.homefeed);
  const user = useAppSelector(state => state.homefeed.user);
  const db = myClient?.fbInstance();
  // console.log('invitedChatroomsFinale', invitedChatrooms);
  // console.log('myChatroomsFinale', myChatrooms);
  const chatrooms = [...invitedChatrooms, ...myChatrooms];
  // console.log('finaleChatrooms', chatrooms);

  async function fetchData() {
    const invitesRes = await dispatch(
      getInvites({channelType: 1, page: 1, pageSize: 10}, true) as any,
    );

    console.log('inviteRes', invitesRes);

    if (!!invitesRes?.userInvites) {
      console.log('yahaHu1');
      if (invitesRes?.userInvites?.length < 10) {
        let payload = {
          page: 1,
        };
        const temp = await dispatch(getHomeFeedData(payload) as any);
        // console.log('homeFeedDataGet', temp);
      } else {
        await dispatch(
          updateInvites({channelType: 1, page: 2, pageSize: 10}, true) as any,
        );
        setInvitePage(invitePage => {
          return invitePage + 1;
        });
      }
    }
  }

  useLayoutEffect(() => {
    fetchData();
  }, [navigation]);

  useEffect(() => {
    const token = async () => {
      const isPermissionEnabled = await requestUserPermission();
      // console.log('isPermissionEnabled', isPermissionEnabled);
      if (isPermissionEnabled) {
        let fcmToken = await fetchFCMToken();
        // console.log('fcmToken', fcmToken);
        if (!!fcmToken) {
          setFCMToken(fcmToken);
        }
      }
    };
    token();
  }, []);

  async function updateData(newPage: number) {
    console.log('updating...');
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
      // console.log('loadData', res);
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
            {channelType: 1, page: invitePage + 1, pageSize: 10},
            true,
          ) as any,
        );
        setInvitePage(invitePage => {
          return invitePage + 1;
        });
        setIsLoading(false);
      } else if (
        myChatrooms?.length > 0 &&
        myChatrooms?.length % 10 === 0 &&
        myChatrooms?.length === 10 * page
      ) {
        const newPage = page + 1;
        dispatch({type: SET_PAGE, body: newPage});
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
        dispatch(getHomeFeedData({page: 1}, false) as any);
        dispatch({type: SET_PAGE, body: 1});
      }
    });
  }, []);

  return (
    <View style={styles.page}>
      <FlashList
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
            avatar: item?.chatroom?.chatroomImageUrl!,
            lastMessage: item?.lastConversation?.answer!,
            lastMessageUser: item?.lastConversation?.member?.name!,
            time: item?.lastConversationTime!,
            unreadCount: item?.unseenConversationCount!,
            pinned: false,
            lastConversation: item?.lastConversation!,
            lastConversationMember: item?.lastConversation?.member?.name!,
            chatroomID: item?.chatroom?.id!,
            isSecret: item?.chatroom?.isSecret,
            deletedBy: item?.lastConversation?.deletedBy,
            inviteReceiver: item?.inviteReceiver,
            chatroomType: item?.chatroom?.type,
            muteStatus: item?.chatroom?.muteStatus,
          };
          return <HomeFeedItem {...homeFeedProps} navigation={navigation} />;
        }}
        extraData={{
          value: [chatrooms, unseenCount, totalCount],
        }}
        estimatedItemSize={15}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => item?.chatroom?.id?.toString()}
      />
    </View>
  );
};

export default GroupFeed;
