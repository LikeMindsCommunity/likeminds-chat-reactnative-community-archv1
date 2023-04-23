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
import {myClient} from '../..';
import {StackActions} from '@react-navigation/native';
import {SHOW_TOAST} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../store';

const DmAllMembers = ({navigation, route}: any) => {
  const [participants, setParticipants] = useState([] as any);
  const [searchedParticipants, setSearchedParticipants] = useState([] as any);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [isEmptyMessageShow, setIsEmptyMessageShow] = useState(false);

  //   const {chatroomID, isSecret} = route.params;
  const dispatch = useAppDispatch();

  const {user, community} = useAppSelector(state => state.homefeed);

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
          {!(Object.keys(!!participants ? participants : 0).length === 0) ? (
            <View style={styles.chatRoomInfo}>
              <Text
                style={{
                  color: STYLES.$COLORS.PRIMARY,
                  fontSize: STYLES.$FONT_SIZES.LARGE,
                  fontFamily: STYLES.$FONT_TYPES.BOLD,
                }}>
                {'Send DM to...'}
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
              setSearchPage(1);
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

  useLayoutEffect(() => {
    fetchParticipants();
    setInitialHeader();
  }, [navigation]);

  useEffect(() => {
    // setInitialHeader();
    if (!!isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [participants]);

  useEffect(() => {
    if (!!isSearch) {
      setSearchHeader();
    }
  }, [search]);

  useEffect(() => {
    if (!!isSearch) {
      if (!!!search) {
        setSearchedParticipants([]);
        setSearchPage(1);
      } else {
        setSearchPage(1);
      }
      setIsEmptyMessageShow(false);
    }

    const delay = setTimeout(() => {
      if (!!isSearch) {
        if (!!search) {
          searchParticipants();
        }
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    if (!!isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [isSearch]);

  const fetchParticipants = async () => {
    const res = await myClient.dmAllMembers({
      community_id: community?.id,
      page: 1,
      member_state: 4,
    });
    setParticipants(res?.members);
    if (!!res && res?.members.length === 10) {
      const response = await myClient.dmAllMembers({
        community_id: community?.id,
        page: 2,
        member_state: 4,
      });
      setParticipants((participants: any) => [
        ...participants,
        ...response?.members,
      ]);
      setPage(2);
    }
  };

  const searchParticipants = async () => {
    const res = await myClient.searchMembers({
      search: search,
      search_type: 'name',
      page: 1,
      page_size: 10,
    });
    setSearchPage(1);
    setSearchedParticipants(res?.members);
    if (!!res && res?.members.length === 10) {
      const response = await myClient.searchMembers({
        search: search,
        search_type: 'name',
        page: 2,
        page_size: 10,
      });
      setSearchedParticipants((searchedParticipants: any) => [
        ...searchedParticipants,
        ...response?.members,
      ]);
      setSearchPage(2);
      setIsEmptyMessageShow(true);
    } else {
      setIsEmptyMessageShow(true);
    }
  };

  async function updateData(newPage: number) {
    if (isSearch) {
      const res = await myClient.searchMembers({
        search: search,
        search_type: 'name',
        page: newPage,
        page_size: 10,
      });
      return res;
    } else {
      const res = await myClient.dmAllMembers({
        community_id: community?.id,
        page: newPage,
        member_state: 4,
      });
      return res;
    }
  }

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    setTimeout(async () => {
      const res = await updateData(newPage);
      if (!!res) {
        if (isSearch) {
          setSearchedParticipants([...searchedParticipants, ...res?.members]);
        } else {
          setParticipants([...participants, ...res?.members]);
        }

        setIsLoading(false);
      }
    }, 500);
  };

  const handleLoadMore = async () => {
    if (!isLoading) {
      let arr = participants;
      if (
        arr?.length % 10 === 0 && arr?.length > 0 && isSearch
          ? arr?.length === 10 * searchPage
          : arr?.length === 10 * page
      ) {
        let newPage = isSearch ? searchPage + 1 : page + 1;
        loadData(newPage);
        if (isSearch) {
          setSearchPage(newPage);
        } else {
          setPage(newPage);
        }
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

  const onUserClicked = async (memberID: any) => {
    const res = await myClient.reqDmFeed({
      member_id: memberID,
    });
    // console.log('canDmFeed', res, community?.id, memberID);

    if (!!res?.is_request_dm_limit_exceeded === false) {
      if (res?.chatroom_id !== undefined) {
        navigation.navigate('ChatRoom', {chatroomID: res?.chatroom_id});
      } else {
        let payload = {
          community_id: community?.id,
          member_id: memberID,
        };
        const response = await myClient.onCreateDM(payload);
        if (!!response?.chatroom?.chatroom_with_user?.id) {
          navigation.navigate('ChatRoom', {
            chatroomID:
              user?.id !== response?.chatroom?.chatroom_with_user?.id
                ? response?.chatroom?.chatroom_with_user?.id
                : response?.chatroom?.member?.id!,
          });
        }
        // console.log('response onCreate =', response);
      }
    } else {
    }
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={isSearch && !!search ? searchedParticipants : participants}
        renderItem={({item}: any) => {
          return (
            <TouchableOpacity
              onPress={() => {
                onUserClicked(item?.id);
              }}
              key={item?.id}
              style={styles.participants}>
              <View>
                <Image
                  source={
                    !!item?.image_url
                      ? {uri: item?.image_url}
                      : require('../../assets/images/default_pic.png')
                  }
                  style={styles.avatar}
                />
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {item?.name}
                  {!!item?.custom_title ? (
                    <Text
                      style={
                        styles.messageCustomTitle
                      }>{` • ${item?.custom_title}`}</Text>
                  ) : null}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => item?.id.toString()}
      />
      {isSearch && isEmptyMessageShow && searchedParticipants.length === 0 && (
        <View style={[styles.justifyCenter]}>
          <Text style={styles.title}>No search results found</Text>
        </View>
      )}
    </View>
  );
};

export default DmAllMembers;
