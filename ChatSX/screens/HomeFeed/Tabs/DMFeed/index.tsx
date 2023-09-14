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
  const [dmChatrooms, setDMChatrooms] = useState([]);
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  const {myDMChatrooms, unseenCount, totalCount, dmPage, invitedChatrooms} =
    useAppSelector(state => state.homefeed);
  const {user, community} = useAppSelector(state => state.homefeed);

  const db = myClient?.firebaseInstance();
  const chatrooms = [...myDMChatrooms];
  const INITIAL_SYNC_PAGE = 1;

  async function fetchData() {
    if (!!community?.id) {
      let payload = {
        page: 1,
      };
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

  // Fetching already existing chatrooms from Realm
  const getExistingData = async () => {
    const existingChatrooms: any = await myClient?.getChatrooms();
    if (!!existingChatrooms && existingChatrooms.length != 0) {
      const filteredChatrooms: any = await myClient?.getFilteredChatrooms(true);
      setDMChatrooms(filteredChatrooms);
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
            const sortedChatroom = await myClient?.getFilteredChatrooms(true);
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
        setDMChatrooms(sortedChatroom);
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

  return (
    <View style={styles.page}>
      {dmChatrooms?.length === 0 ? (
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
          data={dmChatrooms}
          extraData={{
            value: [user, dmChatrooms],
          }}
          estimatedItemSize={15}
          renderItem={({item}: any) => {
            const homeFeedProps = {
              title: item?.chatroomWithUserName,
              avatar: item?.chatroomImageUrl!,
              lastMessage: item?.lastConversation?.answer!,
              lastMessageUser: item?.lastConversation?.member?.name!,
              time: item?.lastConversation?.createdAt!,
              unreadCount: item?.unseenCount!,
              pinned: false,
              lastConversation: item?.lastConversation!,
              chatroomID: item?.id!,
              deletedBy: item?.lastConversationRO?.deletedBy,
              isSecret: item?.isSecret,
              chatroomType: item?.type,
              muteStatus: item?.muteStatus,
            };
            return <HomeFeedItem {...homeFeedProps} navigation={navigation} />;
          }}
          ListFooterComponent={renderFooter}
          keyExtractor={(item: any) => item?.id.toString()}
        />
      )}
      {showDM && dmChatrooms?.length > 0 ? (
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
