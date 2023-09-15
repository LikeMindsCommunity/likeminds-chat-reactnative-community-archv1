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
import {
  GET_HOMEFEED_CHAT_SUCCESS,
  GET_SYNC_HOMEFEED_CHAT_SUCCESS,
  SET_PAGE,
} from '../../../../store/types/types';
import {getUniqueId} from 'react-native-device-info';
import {fetchFCMToken, requestUserPermission} from '../../../../notifications';
import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import Realm from 'realm';
import {Observable} from 'rxjs';

interface Props {
  navigation: any;
}

const GroupFeed = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitePage, setInvitePage] = useState(1);
  const [FCMToken, setFCMToken] = useState('');
  const [groupfeedChatrooms, setGroupfeedChatrooms] = useState([]);
  const isFocused = useIsFocused();
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
  const db = myClient?.firebaseInstance();
  const chatrooms = [...invitedChatrooms, ...myChatrooms];

  const INITIAL_SYNC_PAGE = 1;

  const getExploreTabCount = async () => {
    const exploreTabCount = await myClient?.getExploreTabCount();
    dispatch({type: GET_HOMEFEED_CHAT_SUCCESS, body: exploreTabCount?.data});
  };

  useEffect(() => {
    // To get total number of chatrooms and number of unseen chatrooms
    getExploreTabCount();
  }, []);

  // Fetching already existing chatrooms from Realm
  const getExistingData = async () => {
    const existingChatrooms: any = await myClient?.getChatrooms();
    if (!!existingChatrooms && existingChatrooms.length != 0) {
      const filteredChatroom: any = await myClient?.getFilteredChatrooms(false);
      setGroupfeedChatrooms(filteredChatroom);
    }
  };

  // This useEffect is used to firstly get the already existing chatroom from realm and then call the paginatedSyncAPI
  useEffect(() => {
    if (isFocused) {
      getExistingData();
    }
  }, [isFocused, user]);

  // Listener for Realm which will be called with any kind of change in Realm
  const listener = async () => {
    const chatroomObservable = new Observable(observer => {
      Realm.open(myClient?.getInstance())
        .then(realm => {
          const chatrooms = realm.objects('ChatroomRO');
          const listener = async (newChatrooms: any, changes: any) => {
            const sortedChatroom = await myClient?.getFilteredChatrooms(false);
            observer.next(sortedChatroom);
          };
          chatrooms.addListener(listener);
          return () => {
            chatrooms.removeListener(listener);
            realm.close();
          };
        })
        .catch(error => {
          observer.error(error);
        });
    });
    const subscription = chatroomObservable.subscribe({
      next: (sortedChatroom: any) => {
        setGroupfeedChatrooms(sortedChatroom);
      },
      error: error => {
        Alert.alert('Error observing chatrooms:', error);
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  };

  // This useEffect calls the listener which is attached to realm
  useEffect(() => {
    listener();
  }, [isFocused]);

  async function fetchData() {
    const invitesRes = await dispatch(
      getInvites({channelType: 1, page: 1, pageSize: 10}, false) as any,
    );

    if (!!invitesRes?.userInvites) {
      if (invitesRes?.userInvites?.length < 10) {
        let payload = {
          page: 1,
        };
      } else {
        await dispatch(
          updateInvites({channelType: 1, page: 2, pageSize: 10}, false) as any,
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
      if (isPermissionEnabled) {
        let fcmToken = await fetchFCMToken();
        if (!!fcmToken) {
          setFCMToken(fcmToken);
        }
      }
    };
    token();
  }, []);

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
            {channelType: 1, page: invitePage + 1, pageSize: 10},
            false,
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

  return (
    <View style={styles.page}>
      <FlashList
        data={groupfeedChatrooms}
        ListHeaderComponent={() => (
          <HomeFeedExplore
            newCount={unseenCount}
            totalCount={totalCount}
            navigation={navigation}
          />
        )}
        renderItem={({item}: any) => {
          const homeFeedProps = {
            title: item?.header!,
            avatar: item?.chatroomImageUrl!,
            lastMessage: item?.lastConversation?.answer!,
            lastMessageUser: item?.lastConversation?.member?.name!,
            time: item?.lastConversation?.createdAt!,
            unreadCount: item?.unseenCount!,
            pinned: false,
            lastConversation: item?.lastConversation!,
            lastConversationMember: item?.lastConversationRO?.member?.name!,
            chatroomID: item?.id!,
            isSecret: item?.isSecret,
            deletedBy: item?.lastConversation?.deletedByUserId,
            conversationDeletor:
              item?.lastConversationRO?.deletedByMember?.sdkClientInfo?.uuid,
            conversationCreator:
              item?.lastConversationRO?.member?.sdkClientInfo?.uuid,
            conversationDeletorName:
              item?.lastConversationRO?.deletedByMember?.name,
            inviteReceiver: item?.inviteReceiver,
            chatroomType: item?.type,
            muteStatus: item?.muteStatus,
          };
          return <HomeFeedItem {...homeFeedProps} navigation={navigation} />;
        }}
        extraData={{
          value: [groupfeedChatrooms, unseenCount, totalCount],
        }}
        estimatedItemSize={15}
        ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => {
          return item?.id?.toString();
        }}
      />
    </View>
  );
};

export default GroupFeed;
