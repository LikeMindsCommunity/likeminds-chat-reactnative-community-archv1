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
import {myClient} from '../..';
import {getNameInitials} from '../../commonFuctions';
import HomeFeedExplore from '../../components/HomeFeedExplore';
import HomeFeedItem from '../../components/HomeFeedItem';
import STYLES from '../../constants/Styles';
import {onValue, ref} from '@firebase/database';
import {useAppDispatch, useAppSelector} from '../../store';
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
import {fetchFCMToken, requestUserPermission} from '../../notifications';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import GroupFeed from './Tabs/GroupFeed';
import DMFeed from './Tabs/DMFeed';

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

  const {
    myChatrooms,
    unseenCount,
    totalCount,
    page,
    invitedChatrooms,
    community,
  } = useAppSelector(state => state.homefeed);
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

  const pushAPI = async (fcmToken: any, accessToken: any) => {
    const deviceID = await getUniqueId();
    try {
      const response = await fetch(
        'https://auth.likeminds.community/user/device/push',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-device-id': `${deviceID}`,
            'x-platform-code': Platform.OS === 'ios' ? 'ios' : 'an',
            Authorization: `${accessToken}`,
          },
          body: JSON.stringify({
            token: fcmToken,
          }),
        },
      );
      let res = await response.json();
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

  async function fetchData() {
    let payload = {
      user_unique_id: '',
      user_name: '',
      is_guest: false,
    };
    let res = await dispatch(initAPI(payload) as any);
    if (!!res) {
      await dispatch(
        profileData({
          community_id: res?.community?.id,
          member_id: res?.user?.id,
        }) as any,
      );
      setCommunityId(res.community.id);
      setAccessToken(res?.access_token);
    }

    return res;
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
      {community?.hide_dm_tab === false ? (
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: styles.font,
            tabBarIndicatorStyle: {backgroundColor: STYLES.$COLORS.PRIMARY},
            // tabBarLabelStyle: {
            //   fontSize: 10,
            // },
          }}>
          <Tab.Screen
            name="GroupFeed"
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
            name="DMFeed"
            options={{tabBarLabel: 'DMs'}}
            component={DMFeed}
          />
        </Tab.Navigator>
      ) : community?.hide_dm_tab === true ? (
        <GroupFeed navigation={navigation} />
      ) : null}
    </View>
  );
};

export default HomeFeed;
