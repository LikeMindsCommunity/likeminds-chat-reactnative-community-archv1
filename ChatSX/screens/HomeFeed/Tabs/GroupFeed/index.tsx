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
  GET_SYNC_HOMEFEED_CHAT_SUCCESS,
  SET_PAGE,
} from '../../../../store/types/types';
import {getUniqueId} from 'react-native-device-info';
import {fetchFCMToken, requestUserPermission} from '../../../../notifications';
import {useIsFocused} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import {SyncChatroomRequest} from 'reactnative-chat-data';
import Realm from 'realm';
import {Observable} from 'rxjs';

interface Props {
  navigation: any;
}

const GroupFeed = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitePage, setInvitePage] = useState(1);
  const [FCMToken, setFCMToken] = useState('');
  const [realmChatrooms, setRealmChatrooms] = useState([]);
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

  // Filtering GroupFeed Chatrooms from DMs
  const filterChatrooms = (chatrooms: any) => {
    let chatroomArr: any = [];
    chatrooms.forEach((chatroom: any) => {
      if (chatroom.type !== 10) {
        chatroomArr.push(chatroom);
      }
    });
    return chatroomArr;
  };

  // Sync Chatrrom API
  async function syncChatroomAPI(
    page: number,
    minTimeStamp: number,
    maxTimeStamp: number,
  ) {
    const res = await myClient?.syncChatroom(
      SyncChatroomRequest.builder()
        .setPage(page)
        .setPageSize(50)
        .setChatroomTypes([0, 7])
        .setMaxTimestamp(maxTimeStamp)
        .setMinTimestamp(minTimeStamp)
        .build(),
    );
    return res;
  }

  const callHomeFeedOnce = async () => {
    let payload = {
      page: 1,
    };
    const temp = await dispatch(getHomeFeedData(payload) as any);
  };

  useEffect(() => {
    // To get total number of chatrooms
    callHomeFeedOnce();
  }, []);

  // Pagination call for sync chatroom
  const paginatedSyncAPI = async (page: number, communityId: string) => {
    const timeStampStored = await myClient?.getTimeStamp();
    const temp = JSON.stringify(timeStampStored);
    let parsedTimeStamp = JSON.parse(temp);
    let maxTimeStampNow = Math.floor(Date.now() / 1000);

    // Taking minTimeStamp as 0 for the first time else last maxTimeStamp will become current minTimeStamp
    let minTimeStampNow =
      parsedTimeStamp[0].minTimeStamp == 0
        ? 0
        : parsedTimeStamp[0].maxTimeStamp;

    const val = await syncChatroomAPI(page, minTimeStampNow, maxTimeStampNow);

    const DB_RESPONSE = val?.data;

    if (page === INITIAL_SYNC_PAGE && DB_RESPONSE?.chatroomsData.length !== 0) {
      await myClient?.saveCommunityData(
        DB_RESPONSE?.communityMeta[communityId],
      );
    }

    if (DB_RESPONSE?.chatroomsData.length !== 0) {
      await myClient?.saveChatroomResponse(
        DB_RESPONSE,
        DB_RESPONSE?.chatroomsData,
        communityId,
      );
    }

    myClient?.updateTimeStamp(parsedTimeStamp[0].maxTimeStamp, maxTimeStampNow);

    if (DB_RESPONSE?.chatroomsData?.length === 0) {
      return;
    } else {
      await paginatedSyncAPI(page + 1, communityId);
    }
  };

  // Fetching already existing chatrooms from Realm
  const getExistingData = async () => {
    const existingChatrooms: any = await myClient?.getChatroomData();
    if (!!existingChatrooms && existingChatrooms.length != 0) {
      const temp = filterChatrooms(existingChatrooms);
      setRealmChatrooms(temp);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getExistingData();
      if (!user?.sdkClientInfo?.community) return;
      paginatedSyncAPI(INITIAL_SYNC_PAGE, user?.sdkClientInfo?.community);
    }
  }, [isFocused, user]);

  // Listener for Realm which will be called with any kind of change in Realm
  const listener = async () => {
    const chatroomObservable = new Observable(observer => {
      Realm.open(myClient?.getInstance())
        .then(realm => {
          const chatrooms = realm.objects('ChatroomRO');
          const listener = (newChatrooms: any, changes: any) => {
            const chatroomsArray = Array.from(newChatrooms);
            observer.next(chatroomsArray);
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
      next: (updatedChatrooms: any) => {
        const temp = filterChatrooms(updatedChatrooms);
        // Sorting the updatedChatrooms based on updatedAt
        temp.sort(function (a: any, b: any) {
          var keyA = a.updatedAt,
            keyB = b.updatedAt;
          if (keyA > keyB) return -1;
          if (keyA < keyB) return 1;
          return 0;
        });
        setRealmChatrooms(temp);
      },
      error: error => {
        Alert.alert('Error observing chatrooms:', error);
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  };

  useEffect(() => {
    listener();
  }, [isFocused]);

  useEffect(() => {
    const query = ref(db, `/community/${community?.id}`);
    return onValue(query, snapshot => {
      if (snapshot.exists()) {
        if (!user?.sdkClientInfo?.community) return;
        paginatedSyncAPI(INITIAL_SYNC_PAGE, user?.sdkClientInfo?.community);
      }
    });
  }, [user]);

  async function fetchData() {
    const invitesRes = await dispatch(
      getInvites({channelType: 1, page: 1, pageSize: 10}, false) as any,
    );

    if (!!invitesRes?.userInvites) {
      if (invitesRes?.userInvites?.length < 10) {
        let payload = {
          page: 1,
        };
        // const temp = await dispatch(getHomeFeedData(payload) as any);
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
        data={realmChatrooms}
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
          value: [realmChatrooms, unseenCount, totalCount],
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
