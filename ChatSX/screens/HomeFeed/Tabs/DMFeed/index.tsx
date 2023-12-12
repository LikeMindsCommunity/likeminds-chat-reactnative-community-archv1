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
import {useAppDispatch, useAppSelector} from '../../../../store';
import {
  getInvites,
  initAPI,
  updateDMFeedData,
  updateHomeFeedData,
  updateInvites,
} from '../../../../store/actions/homefeed';
import styles from './styles';
import {
  SET_DM_PAGE,
  SET_INITIAL_DMFEED_CHATROOM,
  INSERT_DMFEED_CHATROOM,
  UPDATE_DMFEED_CHATROOM,
  DELETE_DMFEED_CHATROOM,
} from '../../../../store/types/types';
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
import Realm from 'realm';
import {paginatedSyncAPI} from '../../../../utils/syncChatroomApi';
import LinearGradient from 'react-native-linear-gradient';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import {Events, Keys, Sources} from '../../../../enums';
import {LMChatAnalytics} from '../../../../analytics/LMChatAnalytics';

const ShimmerPlaceHolder = createShimmerPlaceholder(LinearGradient);

interface Props {
  navigation: any;
}

const DMFeed = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shimmerIsLoading, setShimmerIsLoading] = useState(true);
  const [showDM, setShowDM] = useState(false);
  const [showList, setShowList] = useState<any>(null);
  const [FCMToken, setFCMToken] = useState('');
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const {
    myDMChatrooms,
    unseenCount,
    totalCount,
    dmPage,
    invitedChatrooms,
    dmFeedChatrooms,
  } = useAppSelector(state => state.homefeed);
  const {user, community} = useAppSelector(state => state.homefeed);

  const db = myClient?.firebaseInstance();
  const chatrooms = [...myDMChatrooms];
  const INITIAL_SYNC_PAGE = 1;
  let startTime = 0;
  let endTime = 0;

  async function fetchData() {
    if (community?.id) {
      const payload = {
        page: 1,
      };
      const apiRes = await myClient?.checkDMStatus({
        requestFrom: 'dm_feed_v2',
      });
      const response = apiRes?.data;
      if (response) {
        const routeURL = response?.cta;
        const hasShowList = SHOW_LIST_REGEX.test(routeURL);
        if (hasShowList) {
          const showListValue = routeURL.match(SHOW_LIST_REGEX)[1];
          setShowList(showListValue);
        }
        setShowDM(response?.showDm);
      }
    }
  }

  useEffect(() => {
    if (isFocused) {
      LMChatAnalytics.track(
        Events.DM_FEED_OPENED,
        new Map<string, string>([[Keys.SOURCE, Sources.HOME_FEED]]),
      );
    }
  }, [isFocused]);

  useLayoutEffect(() => {
    fetchData();
  }, [navigation, community]);

  useEffect(() => {
    const token = async () => {
      const isPermissionEnabled = await requestUserPermission();
      if (isPermissionEnabled) {
        const fcmToken = await fetchFCMToken();
        if (fcmToken) {
          setFCMToken(fcmToken);
        }
      }
    };
    token();
  }, []);

  // Fetching already existing chatrooms from Realm
  const getChatroomFromLocalDB = async () => {
    const existingChatrooms: any = await myClient?.getFilteredChatrooms(true);
    if (!!existingChatrooms && existingChatrooms.length !== 0) {
      setShimmerIsLoading(false);
      dispatch({
        type: SET_INITIAL_DMFEED_CHATROOM,
        body: {dmFeedChatrooms: existingChatrooms},
      });
    }
  };

  const getAppConfig = async () => {
    const appConfig = await myClient?.getAppConfig();
    if (appConfig?.isDmFeedChatroomsSynced === undefined) {
      startTime = Date.now() / 1000;
      setTimeout(() => {
        myClient?.initiateAppConfig();
        myClient?.setAppConfig(true);
      }, 200);
    } else {
      setShimmerIsLoading(false);
    }
  };

  useEffect(() => {
    const query = ref(db, `/community/${community?.id}`);
    return onValue(query, snapshot => {
      if (snapshot.exists()) {
        if (!user?.sdkClientInfo?.community) {
          return;
        }
        if (isFocused) {
          paginatedSyncAPI(INITIAL_SYNC_PAGE, user, true);
          setShimmerIsLoading(false);
          setTimeout(() => {
            getChatroomFromLocalDB();
          }, 500);
        }
      }
    });
  }, [user, isFocused]);

  useEffect(() => {
    const initiate = async () => {
      await getAppConfig();
      if (!user?.sdkClientInfo?.community) {
        return;
      }
      await paginatedSyncAPI(INITIAL_SYNC_PAGE, user, true);
      if (shimmerIsLoading == true && isFocused) {
        endTime = Date.now() / 1000;
        LMChatAnalytics.track(
          Events.SYNC_COMPLETE,
          new Map<string, string>([
            [Keys.SYNC_COMPLETE, true?.toString()],
            [Keys.TIME_TAKEN, (endTime - startTime)?.toString()],
          ]),
        );
      }
      setShimmerIsLoading(false);
      setTimeout(() => {
        getChatroomFromLocalDB();
      }, 500);
    };
    initiate();
  }, [user, isFocused, shimmerIsLoading, startTime]);

  //function calls updateDMFeedData action to update myDMChatrooms array with the new data.
  async function updateData(newPage: number) {
    const payload = {
      page: newPage,
    };
    const response = await dispatch(updateDMFeedData(payload, false) as any);
    return response;
  }

  // function shows loader in between calling the API and getting the response
  const loadData = async (newPage: number) => {
    setIsLoading(true);
    setTimeout(async () => {
      const res = await updateData(newPage);
      if (res) {
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

  return (
    <View style={styles.page}>
      {dmFeedChatrooms?.length === 0 ? (
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
      ) : shimmerIsLoading ? (
        <>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 50,
            }}>
            <View
              style={{
                width: '20%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ShimmerPlaceHolder
                style={{
                  width: 50,
                  alignItmes: 'center',
                  justifyContent: 'center',
                  borderRadius: 50,
                  height: 50,
                }}
              />
            </View>
            <View style={{width: '100%'}}>
              <ShimmerPlaceHolder style={{width: '70%'}} />
              <ShimmerPlaceHolder style={{marginTop: 10, width: '50%'}} />
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 50,
            }}>
            <View
              style={{
                width: '20%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ShimmerPlaceHolder
                style={{
                  width: 50,
                  alignItmes: 'center',
                  justifyContent: 'center',
                  borderRadius: 50,
                  height: 50,
                }}
              />
            </View>
            <View style={{width: '100%'}}>
              <ShimmerPlaceHolder style={{width: '70%'}} />
              <ShimmerPlaceHolder style={{marginTop: 10, width: '50%'}} />
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 50,
            }}>
            <View
              style={{
                width: '20%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ShimmerPlaceHolder
                style={{
                  width: 50,
                  alignItmes: 'center',
                  justifyContent: 'center',
                  borderRadius: 50,
                  height: 50,
                }}
              />
            </View>
            <View style={{width: '100%'}}>
              <ShimmerPlaceHolder style={{width: '70%'}} />
              <ShimmerPlaceHolder style={{marginTop: 10, width: '50%'}} />
            </View>
          </View>
        </>
      ) : (
        <FlashList
          data={dmFeedChatrooms}
          extraData={{
            value: [user, dmFeedChatrooms],
          }}
          estimatedItemSize={15}
          renderItem={({item}: any) => {
            const userTitle =
              user?.id == item?.chatroomWithUserId
                ? item?.member?.name
                : item?.chatroomWithUser?.name;
            const deletedBy =
              item?.lastConversation?.deletedByUserId !== null
                ? item?.lastConversation?.deletedByUserId
                : item?.lastConversation?.deletedBy;
            const homeFeedProps = {
              title: userTitle,
              avatar: item?.chatroomImageUrl!,
              lastMessage: item?.lastConversation?.answer!,
              lastMessageUser: item?.lastConversation?.member?.name!,
              time: item?.lastConversation?.createdAt!,
              unreadCount: item?.unseenCount!,
              pinned: false,
              lastConversation: item?.lastConversation!,
              lastConversationMember: item?.lastConversation?.member?.name!,
              chatroomID: item?.id!,
              isSecret: item?.isSecret,
              deletedBy: deletedBy,
              conversationDeletor:
                item?.lastConversation?.deletedByMember?.sdkClientInfo?.uuid,
              conversationCreator:
                item?.lastConversation?.member?.sdkClientInfo?.uuid,
              conversationDeletorName:
                item?.lastConversation?.deletedByMember?.name,
              inviteReceiver: item?.inviteReceiver,
              chatroomType: item?.type,
              muteStatus: item?.muteStatus,
            };
            return <HomeFeedItem {...homeFeedProps} navigation={navigation} />;
          }}
          ListFooterComponent={renderFooter}
          keyExtractor={(item: any) => item?.id?.toString()}
        />
      )}
      {showDM && dmFeedChatrooms?.length > 0 ? (
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
