import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {myClient} from '../../..';
import {useAppSelector} from '../../store';
import Layout from '../../constants/Layout';
import {ADD_PARTICIPANTS} from '../../constants/Screens';
import {FlashList} from '@shopify/flash-list';
import {LoaderComponent} from '../../components/LoaderComponent';
import {Events, Keys, Sources} from '../../enums';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';

const ViewParticipants = ({navigation, route}: any) => {
  const [participants, setParticipants] = useState({} as any);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [totalChatroomCount, setTotalChatroomCount] = useState('');
  const [count, setCount] = useState(1);

  const {chatroomID, isSecret, chatroomName} = route.params;
  const user = useAppSelector(state => state.homefeed.user);

  const setInitialHeader = () => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
            <Image
              source={require('../../assets/images/back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          {!(Object.keys(participants ? participants : 0).length === 0) ? (
            <View style={styles.chatRoomInfo}>
              <Text
                style={{
                  color: STYLES.$COLORS.PRIMARY,
                  fontSize: STYLES.$FONT_SIZES.LARGE,
                  fontFamily: STYLES.$FONT_TYPES.BOLD,
                }}>
                {'Participants'}
              </Text>
              <Text
                style={{
                  color: STYLES.$COLORS.MSG,
                  fontSize: STYLES.$FONT_SIZES.SMALL,
                  fontFamily: STYLES.$FONT_TYPES.LIGHT,
                }}>
                {`${totalChatroomCount} participants`}
              </Text>
            </View>
          ) : null}
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setIsSearch(true);
          }}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
          }}>
          <Image
            source={require('../../assets/images/search_icon3x.png')}
            style={styles.search}
          />
        </TouchableOpacity>
      ),
    });
  };

  const setSearchHeader = () => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity
            onPress={() => {
              setSearch('');
              setIsSearch(false);
            }}>
            <Image
              source={require('../../assets/images/back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          <TextInput
            value={search}
            onChangeText={setSearch}
            style={[styles.input]}
            autoFocus={true}
            placeholder="Search..."
            placeholderTextColor="#aaa"
          />
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {}}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 5,
          }}>
          <Image
            source={require('../../assets/images/search_icon3x.png')}
            style={styles.search}
          />
        </TouchableOpacity>
      ),
    });
  };

  const fetchParticipants = async () => {
    const apiRes = await myClient?.getParticipants({
      chatroomId: chatroomID,
      isSecret: isSecret,
      page: 1,
      pageSize: 10,
      participantName: search,
    } as any);
    const res = apiRes?.data;
    LMChatAnalytics.track(
      Events.VIEW_CHATROOM_PARTICIPANTS,
      new Map<string, string>([
        [Keys.CHATROOM_ID, chatroomID?.toString()],
        [Keys.COMMUNITY_ID, user?.sdkClientInfo?.community],
        [Keys.SOURCE, Sources.CHATROOM_OVERFLOW_MENU],
      ]),
    );

    setTotalChatroomCount(res?.totalParticipantsCount);
    setParticipants(res?.participants);
    setCount(0);

    if (!!res && res?.participants.length === 10) {
      const apiResponse = await myClient?.getParticipants({
        chatroomId: chatroomID,
        isSecret: isSecret,
        page: 2,
        pageSize: 10,
        participantName: search,
      } as any);
      const response = apiResponse?.data;

      setParticipants((participants: any) => [
        ...participants,
        ...response?.participants,
      ]);
      setPage(2);
    }
  };

  useLayoutEffect(() => {
    fetchParticipants();
    setInitialHeader();
  }, [navigation]);

  useEffect(() => {
    // setInitialHeader();
    if (isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [participants]);

  useEffect(() => {
    if (isSearch) {
      setSearchHeader();
    }
  }, [search]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (isSearch) {
        fetchParticipants();
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    // setInitialHeader();
    if (isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [isSearch]);

  async function updateData(newPage: number) {
    const payload: any = {
      chatroomId: chatroomID,
      isSecret: isSecret,
      page: newPage,
      pageSize: 10,
      participantName: search,
    };
    const response = await myClient?.getParticipants(payload);
    return response?.data;
  }

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    const res = await updateData(newPage);
    if (res) {
      setParticipants([...participants, ...res?.participants]);
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!isLoading) {
      const arr = participants;
      if (
        arr?.length % 10 === 0 &&
        arr?.length > 0 &&
        arr?.length === 10 * page
      ) {
        const newPage = page + 1;
        loadData(newPage);
        setPage(newPage);
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
        data={participants}
        extraData={{
          value: [user, participants, isSecret],
        }}
        estimatedItemSize={15}
        ListHeaderComponent={() =>
          isSecret && user?.state === 1 && participants.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(ADD_PARTICIPANTS, {
                  chatroomID: chatroomID,
                  isSecret: isSecret,
                  chatroomName: chatroomName,
                });
              }}
              style={styles.participants}>
              <View
                style={{
                  height: 50,
                  width: 50,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: STYLES.$COLORS.SECONDARY,
                  borderRadius: 30,
                  marginRight: 10,
                }}>
                <Image
                  source={require('../../assets/images/participants3x.png')}
                  style={styles.icon}
                />
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {'Add Participants'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({item}: any) => {
          return (
            <View key={item?.id} style={styles.participants}>
              <Image
                source={
                  item?.imageUrl
                    ? {uri: item?.imageUrl}
                    : require('../../assets/images/default_pic.png')
                }
                style={styles.avatar}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {item?.name}
                  {item?.customTitle ? (
                    <Text
                      style={
                        styles.messageCustomTitle
                      }>{` • ${item?.customTitle}`}</Text>
                  ) : null}
                </Text>
              </View>
            </View>
          );
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => item?.id?.toString()}
      />
      {participants?.length === 0 && (
        <View style={[styles.justifyCenter]}>
          <Text style={styles.title}>No search results found</Text>
        </View>
      )}
      {count > 0 && <LoaderComponent />}
    </View>
  );
};

export default ViewParticipants;
