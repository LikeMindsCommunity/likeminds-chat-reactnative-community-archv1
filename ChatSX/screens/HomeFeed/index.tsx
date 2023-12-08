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
  Linking,
} from 'react-native';
import {myClient} from '../../..';
import {getNameInitials} from '../../commonFuctions';
import STYLES from '../../constants/Styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {getMemberState, initAPI} from '../../store/actions/homefeed';
import styles from './styles';
import {UPDATE_FILE_UPLOADING_OBJECT} from '../../store/types/types';
import {getUniqueId} from 'react-native-device-info';
import {fetchFCMToken, requestUserPermission} from '../../notifications';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import GroupFeed from './Tabs/GroupFeed';
import DMFeed from './Tabs/DMFeed';
import {FAILED, USER_SCHEMA_RO} from '../../constants/Strings';
import {DM_FEED, GROUP_FEED} from '../../constants/Screens';
import {useIsFocused} from '@react-navigation/native';
import {useQuery} from '@realm/react';
import {parseDeepLink} from '../../components/ParseDeepLink';
import {DeepLinkRequest} from '../../components/ParseDeepLink/models';
import {UserSchemaResponse} from '../../db/models';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';
import {Events, Keys} from '../../enums';
import {Credentials} from '../../credentials';

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
  const users = useQuery<UserSchemaResponse>(USER_SCHEMA_RO);

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
            backgroundColor: user?.imageUrl ? 'white' : 'purple',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
            paddingTop: Platform.OS === 'ios' ? 5 : 3,
          }}>
          {user?.imageUrl ? (
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
              {user?.name ? getNameInitials(user?.name) : ''}
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

    const UUID =
      Credentials.userUniqueId.length > 0
        ? Credentials.userUniqueId
        : users[0]?.userUniqueID;
    const userName =
      Credentials.username.length > 0
        ? Credentials.username
        : users[0]?.userName;

    const payload = {
      uuid: UUID, // uuid
      userName: userName, // user name
      isGuest: false,
    };

    const res = await dispatch(initAPI(payload) as any);

    if (res) {
      setCommunityId(res?.community?.id);
      setAccessToken(res?.accessToken);
      await dispatch(getMemberState() as any);
      LMChatAnalytics.track(
        Events.COMMUNITY_TAB_CLICKED,
        new Map<string, string>([[Keys.USER_ID, res?.user?.id]]),
      );
    }

    return res;
  }

  useLayoutEffect(() => {
    fetchData();
  }, [navigation, myClient]);

  useEffect(() => {
    const listener = Linking.addEventListener('url', ({url}) => {
      const uuid =
        Credentials.userUniqueId.length > 0
          ? Credentials.userUniqueId
          : users[0]?.userUniqueID;
      const userName =
        Credentials.username.length > 0
          ? Credentials.username
          : users[0]?.userName;

      const exampleRequest: DeepLinkRequest = {
        uri: url,
        uuid: uuid, // uuid
        userName: userName, // user name
        isGuest: false,
      };

      // Example usage to call parseDeepLink() method

      parseDeepLink(exampleRequest, response => {
        // Parsed response
      });
    });

    return () => {
      listener.remove();
    };
  }, []);

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

  useEffect(() => {
    const func = async () => {
      const res: any = await myClient?.getAllAttachmentUploadConversations();
      if (res) {
        const len = res.length;
        if (len > 0) {
          for (let i = 0; i < len; i++) {
            const data = res[i];
            const uploadingFilesMessagesSavedObject = JSON.parse(data?.value);
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
    const timeSetter = async () => {
      const timeStampStored = await myClient?.getTimeStamp();
      if (timeStampStored.length === 0) {
        await myClient?.initiateTimeStamp();
      }
    };
    timeSetter();
  }, []);

  useEffect(() => {
    if (FCMToken && accessToken) {
      pushAPI(FCMToken, accessToken);
    }
  }, [FCMToken, accessToken]);

  useEffect(() => {
    if (user) {
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
