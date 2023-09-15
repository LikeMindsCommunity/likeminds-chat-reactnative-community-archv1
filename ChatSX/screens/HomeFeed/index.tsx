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
  AppState,
} from 'react-native';
import {myClient} from '../../..';
import {getNameInitials} from '../../commonFuctions';
import STYLES from '../../constants/Styles';
import {useAppDispatch, useAppSelector} from '../../../store';
import {getMemberState, initAPI} from '../../store/actions/homefeed';
import styles from './styles';
import {UPDATE_FILE_UPLOADING_OBJECT} from '../../store/types/types';
import {getUniqueId} from 'react-native-device-info';
import {fetchFCMToken, requestUserPermission} from '../../notifications';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import GroupFeed from './Tabs/GroupFeed';
import DMFeed from './Tabs/DMFeed';
import {FAILED} from '../../constants/Strings';
import {DM_FEED, GROUP_FEED} from '../../constants/Screens';
import {SyncChatroomRequest} from 'reactnative-chat-data';
import {useIsFocused} from '@react-navigation/native';
import {useQuery} from '@realm/react';
import {onValue, ref} from '@firebase/database';
import {paginatedSyncAPI} from '../../utils/syncChatroomApi';

interface Props {
  navigation: any;
}

const Tab = createMaterialTopTabNavigator();

const HomeFeed = ({navigation}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [communityId, setCommunityId] = useState('');
  const [invitePage, setInvitePage] = useState(1);
  const [FCMToken, setFCMToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const db = myClient?.firebaseInstance();

  const {
    myChatrooms,
    unseenCount,
    totalCount,
    page,
    invitedChatrooms,
    community,
  } = useAppSelector(state => state.homefeed);
  const user = useAppSelector(state => state.homefeed.user);
  const {uploadingFilesMessages} = useAppSelector(state => state.upload);
  const users = useQuery('UserSchemaRO');

  const INITIAL_SYNC_PAGE = 1;

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
            backgroundColor: !!user?.imageUrl ? 'white' : 'purple',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
            paddingTop: Platform.OS === 'ios' ? 5 : 3,
          }}>
          {!!user?.imageUrl ? (
            <Image source={{uri: user?.imageUrl}} style={styles.avatar} />
          ) : (
            <Text
              style={{
                color: STYLES.$COLORS.TERTIARY,
                fontSize: STYLES.$FONT_SIZES.LARGE,
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

  //push API to receive firebase notifications
  const pushAPI = async (fcmToken: any, accessToken: any) => {
    const deviceID = await getUniqueId();
    try {
      const payload = {
        token: fcmToken,
        xDeviceId: deviceID,
        xPlatformCode: Platform.OS === 'ios' ? 'ios' : 'an',
      };
      await myClient.registerDevice(payload);
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

  async function fetchData() {
    //this line of code is for the sample app only, pass your uuid instead of this.

    const UUID = users[0]?.userUniqueID;
    const userName = users[0]?.userName;

    let payload = {
      uuid: UUID, // uuid
      userName: userName, // user name
      isGuest: false,
    };

    let res = await dispatch(initAPI(payload) as any);

    if (!!res) {
      await dispatch(getMemberState() as any);

      setCommunityId(res?.community?.id);
      setAccessToken(res?.accessToken);
    }

    return res;
  }

  const timeSetter = async () => {
    const timeStampStored = await myClient?.getTimeStamp();
    if (timeStampStored.length == 0) {
      // Setting the initial timeStamp for the first time
      const maxTimeStamp = Math.floor(Date.now() / 1000);
      const minTimeStamp = 0;
      myClient?.saveTimeStamp(minTimeStamp, maxTimeStamp);
    } else {
      const temp = JSON.stringify(timeStampStored);
      let parsedTimeStamp = JSON.parse(temp);
      myClient?.updateTimeStamp(
        parsedTimeStamp[0].maxTimeStamp,
        Math.floor(Date.now() / 1000),
      );
    }
  };

  useEffect(() => {
    timeSetter();
  }, [isFocused]);

  useLayoutEffect(() => {
    fetchData();
  }, [navigation, myClient]);

  useEffect(() => {
    const query = ref(db, `/community/${community?.id}`);
    return onValue(query, snapshot => {
      if (snapshot.exists()) {
        if (!user?.sdkClientInfo?.community) return;
        paginatedSyncAPI(INITIAL_SYNC_PAGE, user);
      }
    });
  }, [user]);

  useEffect(() => {
    if (isFocused) {
      if (!user?.sdkClientInfo?.community) return;
      paginatedSyncAPI(INITIAL_SYNC_PAGE, user);
    }
  }, [isFocused, user]);

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

  useEffect(() => {
    const func = async () => {
      // const res: any = await AsyncStorage.getItem('uploadingFilesMessages');
      const res: any = await myClient?.getAllAttachmentUploadConversations();

      if (res) {
        let len = res.length;
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            let data = res[i];
            let uploadingFilesMessagesSavedObject = JSON.parse(data?.value);
            dispatch({
              type: UPDATE_FILE_UPLOADING_OBJECT,
              body: {
                message: {
                  ...uploadingFilesMessagesSavedObject,
                  isInProgress: FAILED,
                },
                ID: data?.key,
              },
            });
          }
        }
      }
    };

    func();
  }, []);

  useEffect(() => {
    if (FCMToken && accessToken) {
      pushAPI(FCMToken, accessToken);
    }
  }, [FCMToken, accessToken]);

  useEffect(() => {
    if (!!user) {
      setOptions();
    }
  }, [user]);

  const renderLabel = ({route}: any) => (
    <Text style={styles.font}>{route.title}</Text>
  );

  return (
    <View style={styles.page}>
      {community?.hideDmTab === false ? (
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: styles.font,
            tabBarIndicatorStyle: {backgroundColor: STYLES.$COLORS.PRIMARY},
          }}>
          <Tab.Screen
            name={GROUP_FEED}
            options={{
              tabBarLabel: ({focused}) => (
                <Text
                  style={[
                    styles.font,
                    {
                      color: focused
                        ? STYLES.$COLORS.PRIMARY
                        : STYLES.$COLORS.MSG,
                    },
                  ]}>
                  Groups
                </Text>
              ),
            }}
            component={GroupFeed}
          />
          <Tab.Screen
            name={DM_FEED}
            options={{tabBarLabel: 'DMs'}}
            component={DMFeed}
          />
        </Tab.Navigator>
      ) : community?.hideDmTab === true ? (
        <GroupFeed navigation={navigation} />
      ) : null}
    </View>
  );
};

export default HomeFeed;
