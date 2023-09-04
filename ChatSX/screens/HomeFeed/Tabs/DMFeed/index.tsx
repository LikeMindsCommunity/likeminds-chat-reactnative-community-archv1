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
import {myClient} from '../../../../..';
import {SHOW_LIST_REGEX, getNameInitials} from '../../../../commonFuctions';
import HomeFeedExplore from '../../../../components/HomeFeedExplore';
import HomeFeedItem from '../../../../components/HomeFeedItem';
import STYLES from '../../../../constants/Styles';
import {onValue, ref} from '@firebase/database';
import {useAppDispatch, useAppSelector} from '../../../../../store';
import {
  getDMFeedData,
  getHomeFeedData,
  getInvites,
  initAPI,
  updateDMFeedData,
  updateHomeFeedData,
  updateInvites,
} from '../../../../store/actions/homefeed';
import styles from './styles';
import {SET_DM_PAGE} from '../../../../store/types/types';
import {getUniqueId} from 'react-native-device-info';
import {fetchFCMToken, requestUserPermission} from '../../../../notifications';
import {DM_ALL_MEMBERS} from '../../../../constants/Screens';
import {
  DM_INFO,
  NEW_MESSAGE_BTN_TEXT,
  NO_DM,
  NO_DM_TEXT,
} from '../../../../constants/Strings';
import {FlashList} from '@shopify/flash-list';
import {useIsFocused} from '@react-navigation/native';
import {SyncChatroomRequest} from 'reactnative-chat-data';
import Realm from 'realm';
import {Observable} from 'rxjs';

interface Props {
  navigation: any;
}

const DMFeed = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [showList, setShowList] = useState<any>(null);
  const [FCMToken, setFCMToken] = useState('');
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const [realmDM, setRealmDM] = useState([]);

  const {myDMChatrooms, unseenCount, totalCount, dmPage, invitedChatrooms} =
    useAppSelector(state => state.homefeed);
  const {user, community} = useAppSelector(state => state.homefeed);
  const INITIAL_SYNC_PAGE = 1;

  const db = myClient?.firebaseInstance();
  const chatrooms = [...myDMChatrooms];

  async function fetchData() {
    if (!!community?.id) {
      let payload = {
        page: 1,
      };
      const res = await dispatch(getDMFeedData(payload) as any);

      if (!!res) {
        let apiRes = await myClient?.checkDMStatus({
          requestFrom: 'dm_feed_v2',
        });
        let response = apiRes?.data;

        if (!!response) {
          let routeURL = response?.cta;
          const hasShowList = SHOW_LIST_REGEX.test(routeURL);

          if (hasShowList) {
            const showListValue = routeURL.match(SHOW_LIST_REGEX)[1];

            setShowList(showListValue);
          }
          setShowDM(response?.showDm);
        }
      }
    }
  }

  // sync Chatrrom API
  async function syncChatroomAPI(
    page: number,
    minTimeStamp: number,
    maxTimeStamp: number,
  ) {
    const res = await myClient?.syncChatroom(
      SyncChatroomRequest.builder()
        .setPage(page)
        .setPageSize(50)
        .setChatroomTypes([10])
        .setMaxTimestamp(maxTimeStamp)
        .setMinTimestamp(minTimeStamp)
        .build(),
    );
    return res;
  }

  // pagination call for sync chatroom
  const paginatedSyncAPI = async (page: number, communityId: string) => {
    const timeStampStored = await myClient?.getTimeStamp();
    const temp = JSON.stringify(timeStampStored);
    let parsedTimeStamp = JSON.parse(temp);
    let maxTimeStampNow = Math.floor(Date.now() / 1000);

    let minTimeStampNow =
      parsedTimeStamp[0].minTimeStamp == 0
        ? 0
        : parsedTimeStamp[0].maxTimeStamp;

    const val = await syncChatroomAPI(page, minTimeStampNow, maxTimeStampNow);

    const DB_RESPONSE = val?.data;

    if (page === INITIAL_SYNC_PAGE && DB_RESPONSE?.chatroomsData.length !== 0) {
      myClient?.saveCommunityData(DB_RESPONSE?.communityMeta[communityId]);
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

  const getExistingData = async () => {
    const existingDM: any = await myClient?.getChatroomData();
    if (!!existingDM && existingDM.length != 0) {
      console.log('realmDM1', realmDM);
      setRealmDM(existingDM);
    }
  };

  // useEffect(() => {
  //   if (isFocused) {
  //     getExistingData();
  //     if (!user?.sdkClientInfo?.community) return;
  //     paginatedSyncAPI(INITIAL_SYNC_PAGE, user?.sdkClientInfo?.community);
  //   }
  // }, [isFocused, user]);

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
      next: (updatedDM: any) => {
        updatedDM.sort(function (a: any, b: any) {
          var keyA = a.updatedAt,
            keyB = b.updatedAt;
          if (keyA > keyB) return -1;
          if (keyA < keyB) return 1;
          return 0;
        });
        console.log('realmDM2', updatedDM);
        setRealmDM(updatedDM);
      },
      error: error => {
        Alert.alert('Error observing chatrooms:', error);
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  };

  // useEffect(() => {
  //   listener();
  // }, [isFocused]);

  // useLayoutEffect(() => {
  //   fetchData();
  // }, [navigation, community]);

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

  // useEffect(() => {
  //   const query = ref(db, `/community/${community?.id}`);
  //   return onValue(query, snapshot => {
  //     if (snapshot.exists()) {
  //       if (!user?.sdkClientInfo?.community) return;
  //       paginatedSyncAPI(INITIAL_SYNC_PAGE, user?.sdkClientInfo?.community);
  //     }
  //   });
  // }, [user]);

  return (
    <View style={styles.page}>
      {chatrooms?.length === 0 ? (
        <View style={styles.nothingDM}>
          <View style={[styles.justifyCenter]}>
            <Image
              style={styles.nothingImg}
              source={require('../../../../assets/images/nothing3x.png')}
            />
            <Text style={styles.title}>{NO_DM}</Text>
            <Text style={styles.subTitle}>{NO_DM_TEXT}</Text>

            <Pressable
              onPress={() => {
                navigation.navigate(DM_ALL_MEMBERS, {showList: showList});
              }}
              style={({pressed}) => [
                {opacity: pressed ? 0.5 : 1.0},
                styles.nothingFab,
              ]}>
              <Image
                style={styles.fabImg}
                source={require('../../../../assets/images/new_message_icon3x.png')}
              />
              <Text style={styles.text}>{NEW_MESSAGE_BTN_TEXT}</Text>
            </Pressable>
          </View>

          <Text
            style={[
              styles.subTitle,
              {marginBottom: 30, paddingHorizontal: 10},
            ]}>
            {DM_INFO}
          </Text>
        </View>
      ) : (
        <FlashList
          data={realmDM}
          extraData={{
            value: [user, realmDM],
          }}
          estimatedItemSize={15}
          renderItem={({item}: any) => {
            let chatroomWithUser = item?.chatroom?.chatroomWithUser;
            let chatroom = item?.chatroom;
            const homeFeedProps = {
              title:
                user?.id !== chatroomWithUser?.id
                  ? chatroomWithUser?.name
                  : chatroom?.member?.name!,
              avatar:
                user?.id !== chatroomWithUser?.id
                  ? chatroomWithUser?.imageUrl!
                  : chatroom?.member?.imageUrl!,
              lastMessage: item?.lastConversation?.answer!,
              lastMessageUser: item?.lastConversation?.member?.name!,
              time: item?.lastConversationTime!,
              unreadCount: item?.unseenConversationCount!,
              pinned: false,
              lastConversation: item?.lastConversation!,
              chatroomID: chatroom?.id!,
              deletedBy: item?.lastConversation?.deletedBy,
              conversationDeletor:
                item?.lastConversation?.deletedByMember?.sdkClientInfo?.uuid,
              conversationCreator:
                item?.lastConversation?.member?.sdkClientInfo?.uuid,
              conversationDeletorName:
                item?.lastConversation?.deletedByMember?.name,
              isSecret: chatroom?.isSecret,
              chatroomType: chatroom?.type,
              muteStatus: chatroom?.muteStatus,
            };
            return <HomeFeedItem {...homeFeedProps} navigation={navigation} />;
          }}
          // onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          keyExtractor={(item: any) => item?.chatroom?.id.toString()}
        />
      )}
      {showDM && chatrooms?.length > 0 ? (
        <Pressable
          onPress={() => {
            navigation.navigate(DM_ALL_MEMBERS, {showList: showList});
          }}
          style={({pressed}) => [{opacity: pressed ? 0.5 : 1.0}, styles.fab]}>
          <Image
            style={styles.fabImg}
            source={require('../../../../assets/images/new_message_icon3x.png')}
          />
          <Text style={styles.text}>{NEW_MESSAGE_BTN_TEXT}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default DMFeed;
