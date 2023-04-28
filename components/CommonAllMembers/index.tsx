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
import {CHATROOM} from '../../constants/Screens';

const CommonAllMembers = ({navigation, chatroomID, isDM}: any) => {
  const [participants, setParticipants] = useState([] as any);
  const [searchedParticipants, setSearchedParticipants] = useState([] as any);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [isEmptyMessageShow, setIsEmptyMessageShow] = useState(false);
  const [isStopPagination, setIsStopPagination] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([] as any);
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
              {isDM ? (
                <View>
                  <Text
                    style={{
                      color: STYLES.$COLORS.PRIMARY,
                      fontSize: STYLES.$FONT_SIZES.LARGE,
                      fontFamily: STYLES.$FONT_TYPES.BOLD,
                    }}>
                    {'Send DM to...'}
                  </Text>
                </View>
              ) : (
                <View>
                  <Text
                    style={{
                      color: STYLES.$COLORS.PRIMARY,
                      fontSize: STYLES.$FONT_SIZES.LARGE,
                      fontFamily: STYLES.$FONT_TYPES.BOLD,
                    }}>
                    {'Add Participants'}
                  </Text>
                  <Text
                    style={{
                      color: STYLES.$COLORS.MSG,
                      fontSize: STYLES.$FONT_SIZES.SMALL,
                      fontFamily: STYLES.$FONT_TYPES.LIGHT,
                    }}>
                    {`${selectedParticipants.length} selected`}
                  </Text>
                </View>
              )}
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

  //useLayoutEffect calls to fetch API before UI loads
  useLayoutEffect(() => {
    if (isDM) {
      fetchDMParticipants();
    } else {
      fetchParticipants();
    }

    setInitialHeader();
  }, [navigation]);

  //to update header when we have API data, initially header will be printed but it's details that comes from API will not be shown as API is async call.
  useEffect(() => {
    if (!!isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [participants]);

  // when we type something to search, this useEffect will update search Header with that searched letter.
  useEffect(() => {
    if (!!isSearch) {
      setSearchHeader();
    }
  }, [search]);

  // debouncing logic for search API call.
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

    //debouncing logic
    const delay = setTimeout(() => {
      if (!!isSearch) {
        if (!!search) {
          searchParticipants();
        }
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  // to update count of selected participants on header
  useEffect(() => {
    if (!isSearch && !!!isDM) {
      setInitialHeader();
    }
  }, [selectedParticipants]);

  // for changing header when we search and when we don't search.
  useEffect(() => {
    if (!!isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [isSearch]);

  //function fetch all members of the community.
  const fetchParticipants = async () => {
    const res = await myClient.getAllMembers({page: 1});
    setParticipants(res?.members);
    if (!!res && res?.members.length === 10) {
      const response = await myClient.getAllMembers({page: 2});
      setParticipants((participants: any) => [
        ...participants,
        ...response?.members,
      ]);
      setPage(2);
    }
  };

  //function fetch all members of the community for DM.
  const fetchDMParticipants = async () => {
    const res = await myClient.dmAllMembers({
      community_id: community?.id,
      page: 1,
      member_state: 4,
    });
    console.log('res fetchDMParticipants =', res);
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

  //function search members in the community.
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

  // this function calls to send secret chatroom invites, here chatroomID would be same id of chatroom which we wanna invite.
  const sendInvites = async () => {
    const res = await myClient.sendInvites({
      chatroom_id: chatroomID,
      is_secret: true,
      chatroom_participants: selectedParticipants,
    });
    const popAction = StackActions.pop(2);
    navigation.dispatch(popAction);
    dispatch({
      type: SHOW_TOAST,
      body: {isToast: true, msg: 'Invitation sent'},
    });
  };

  //function calls action to update members array with the new data.
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
      if (isDM) {
        const res = await myClient.dmAllMembers({
          community_id: community?.id,
          page: newPage,
          member_state: 4,
        });
        return res;
      } else {
        const res = await myClient.getAllMembers({page: newPage});
        return res;
      }
    }
  }

  // function shows loader in between calling the API and getting the response
  const loadData = async (newPage: number) => {
    setIsLoading(true);
    setTimeout(async () => {
      const res = await updateData(newPage);
      if (res?.members.length === 0) {
        setIsStopPagination(true);
      }
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

  //function checks the pagination logic, if it verifies the condition then call loadData
  const handleLoadMore = async () => {
    if (!isLoading) {
      let arr = participants;
      if (!isStopPagination) {
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

  //pagination loader in the footer
  const renderFooter = () => {
    return isLoading ? (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator size="large" color={STYLES.$COLORS.SECONDARY} />
      </View>
    ) : null;
  };

  // this function calls when user click for DM on members screen. Here ChatroomID is gonna be clicked chatroomID
  const onUserClicked = async (memberID: any) => {
    const res = await myClient.reqDmFeed({
      member_id: memberID,
    });
    console.log('reqDmFeed', res);
    if (res?.success === false) {
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: `${res?.error_message}`},
      });
    } else if (!!res?.chatroom_id) {
      navigation.navigate(CHATROOM, {chatroomID: res?.chatroom_id});
    } else if (res?.is_request_dm_limit_exceeded === false) {
      let payload = {
        community_id: community?.id,
        member_id: memberID,
      };
      const response = await myClient.onCreateDM(payload);
      if (!!response?.chatroom?.id) {
        navigation.navigate(CHATROOM, {
          chatroomID: response?.chatroom?.id,
        });
      }
    } else {
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: `DM request limit exceeded`},
      });
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
                if (isDM) {
                  onUserClicked(item?.id);
                } else {
                  if (!selectedParticipants.includes(item?.id)) {
                    setSelectedParticipants([
                      ...selectedParticipants,
                      item?.id,
                    ]);
                  } else {
                    let filteredArr = selectedParticipants.filter(
                      (val: any) => {
                        return val !== item?.id;
                      },
                    );
                    setSelectedParticipants([...filteredArr]);
                  }
                }
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
                {selectedParticipants.includes(item?.id) && !isDM ? (
                  <View style={styles.selected}>
                    <Image
                      source={require('../../assets/images/white_tick3x.png')}
                      style={styles.smallIcon}
                    />
                  </View>
                ) : null}
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

      {selectedParticipants.length > 0 && !isDM ? (
        <TouchableOpacity
          onPress={() => {
            if (selectedParticipants.length > 0) {
              sendInvites();
            }
          }}
          style={styles.sendBtn}>
          <Image
            source={require('../../assets/images/send_arrow3x.png')}
            style={styles.sendIcon}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default CommonAllMembers;