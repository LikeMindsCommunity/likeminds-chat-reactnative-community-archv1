import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {myClient} from '../../..';
import {StackActions} from '@react-navigation/native';
import {SHOW_TOAST} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../store';
import {CHATROOM} from '../../constants/Screens';
import {CANCEL_BUTTON, REQUEST_DM_LIMIT} from '../../constants/Strings';
import {formatTime} from '../../commonFuctions';
import {FlashList} from '@shopify/flash-list';
import {LoaderComponent} from '../LoaderComponent';
import {Events, Keys} from '../../enums';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';

const CommonAllMembers = ({
  navigation,
  chatroomID,
  isDM,
  chatroomName,
  showList,
}: any) => {
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
  const [count, setCount] = useState(1);

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
          {!(Object.keys(participants ? participants : 0).length === 0) ? (
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
    if (isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [participants]);

  // when we type something to search, this useEffect will update search Header with that searched letter.
  useEffect(() => {
    if (isSearch) {
      setSearchHeader();
    }
  }, [search]);

  // debouncing logic for search API call.
  useEffect(() => {
    if (isSearch) {
      if (!search) {
        setSearchedParticipants([]);
        setSearchPage(1);
      } else {
        setSearchPage(1);
      }
      setIsEmptyMessageShow(false);
    }

    //debouncing logic
    const delay = setTimeout(() => {
      if (isSearch) {
        if (search) {
          searchParticipants();
        }
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  // to update count of selected participants on header
  useEffect(() => {
    if (!isSearch && !isDM) {
      setInitialHeader();
    }
  }, [selectedParticipants]);

  // for changing header when we search and when we don't search.
  useEffect(() => {
    if (isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [isSearch]);

  //function fetch all members of the community.
  const fetchParticipants = async () => {
    const res = await myClient?.getAllMembers({page: 1});
    setParticipants(res?.data?.members);
    setCount(0);
  };

  //function fetch all members of the community for DM.
  const fetchDMParticipants = async () => {
    const initialPayload =
      showList == 1
        ? {
            page: 1,
          }
        : {
            page: 1,
            memberState: 1,
          };
    const res = await myClient.getAllMembers(initialPayload);
    setParticipants(res?.data?.members);
    setCount(0);
  };

  //function search members in the community.
  const searchParticipants = async () => {
    const initialPayload =
      showList == 1
        ? {
            search: search,
            searchType: 'name',
            page: 1,
            pageSize: 10,
          }
        : showList == 2
        ? {
            search: search,
            searchType: 'name',
            page: 1,
            pageSize: 10,
            memberStates: '[1]',
          }
        : {
            search: search,
            searchType: 'name',
            page: 1,
            pageSize: 10,
          };
    const apiRes = await myClient?.searchMembers(initialPayload);
    const res = apiRes?.data;

    setSearchPage(1);
    setSearchedParticipants(res?.members);
    if (!!res && res?.members.length === 10) {
      const changedPayload = {...initialPayload, page: 2};
      const response = await myClient?.searchMembers(changedPayload);
      setSearchedParticipants((searchedParticipants: any) => [
        ...searchedParticipants,
        ...response?.data?.members,
      ]);
      setSearchPage(2);
      setIsEmptyMessageShow(true);
    } else {
      setIsEmptyMessageShow(true);
    }
  };

  // this function calls to send secret chatroom invites, here chatroomID would be same id of chatroom which we wanna invite.
  const sendInvites = async () => {
    const res = await myClient?.sendInvites({
      chatroomId: chatroomID,
      isSecret: true,
      chatroomParticipants: selectedParticipants,
    });
    const popAction = StackActions.pop(2);
    navigation.dispatch(popAction);
    dispatch({
      type: SHOW_TOAST,
      body: {isToast: true, msg: 'Invitation sent'},
    });
    LMChatAnalytics.track(
      Events.SECRET_CHATROOM_INVITE,
      new Map<string, string>([
        [Keys.CHATROOM_NAME, chatroomName?.toString()],
        [Keys.CHATROOM_ID, chatroomID?.toString()],
      ]),
    );
  };

  //function calls action to update members array with the new data.
  async function updateData(newPage: number) {
    if (isSearch) {
      const initialPayload =
        showList == 1
          ? {
              search: search,
              searchType: 'name',
              page: 1,
              pageSize: 10,
            }
          : showList == 2
          ? {
              search: search,
              searchType: 'name',
              page: 1,
              pageSize: 10,
              memberStates: '[1]',
            }
          : {
              //for Add Participant screen in case of CM
              search: search,
              searchType: 'name',
              page: 1,
              pageSize: 10,
            };
      if (searchedParticipants > 0) {
        const res = await myClient?.searchMembers(initialPayload);
        return res?.data;
      }
      return;
    } else {
      if (isDM) {
        const res = await myClient?.getAllMembers(
          showList == 1
            ? {
                page: newPage,
              }
            : showList == 2
            ? {
                page: newPage,
                memberState: 1,
              }
            : {
                page: newPage,
              },
        );
        return res?.data;
      } else {
        const res = await myClient?.getAllMembers({page: newPage});
        return res?.data;
      }
    }
  }

  // function shows loader in between calling the API and getting the response
  const loadData = async (newPage: number) => {
    setIsLoading(true);

    const res = await updateData(newPage);

    if (res?.members.length === 0) {
      setIsStopPagination(true);
    }
    if (res) {
      if (isSearch) {
        setSearchedParticipants((searchedParticipants: any) => [
          ...searchedParticipants,
          ...res?.members,
        ]);
      } else {
        setParticipants((participants: any) => [
          ...participants,
          ...res?.members,
        ]);
      }
    }
    setIsLoading(false);
  };

  //function checks the pagination logic, if it verifies the condition then call loadData
  const handleLoadMore = async () => {
    if (!isLoading) {
      //participants check to hide loader when there is no Data
      if (!isStopPagination && participants.length > 0) {
        const newPage = isSearch ? searchPage + 1 : page + 1;
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
  const onUserClicked = async (uuid: any) => {
    const apiRes = await myClient?.checkDMLimit({
      uuid: uuid,
    });
    const res = apiRes?.data;
    if (apiRes?.success === false) {
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: `${apiRes?.errorMessage}`},
      });
    } else {
      const clickedChatroomID = res?.chatroomId;
      if (clickedChatroomID) {
        navigation.navigate(CHATROOM, {chatroomID: clickedChatroomID});
      } else {
        if (res?.isRequestDmLimitExceeded === false) {
          const payload = {
            uuid: uuid,
          };
          const apiResponse = await myClient?.createDMChatroom(payload);

          LMChatAnalytics.track(
            Events.DM_CHAT_ROOM_CREATED,
            new Map<string, string>([
              [Keys.SENDER_ID, user?.id?.toString()],
              [
                Keys.RECEIVER_ID,
                apiResponse?.data?.chatroom?.chatroomWithUser?.id?.toString(),
              ],
            ]),
          );
          const response = apiResponse?.data;
          if (apiResponse?.success === false) {
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: `${apiResponse?.errorMessage}`},
            });
          } else {
            const createdChatroomID = response?.chatroom?.id;
            if (createdChatroomID) {
              navigation.navigate(CHATROOM, {
                chatroomID: createdChatroomID,
              });
            }
          }
        } else {
          const userDMLimit = res?.userDmLimit;
          Alert.alert(
            REQUEST_DM_LIMIT,
            `You can only send ${
              userDMLimit?.numberInDuration
            } DM requests per ${
              userDMLimit?.duration
            }.\n\nTry again in ${formatTime(res?.newRequestDmTimestamp)}`,
            [
              {
                text: CANCEL_BUTTON,
                style: 'default',
              },
            ],
          );
        }
      }
    }
  };

  return (
    <View style={styles.page}>
      <FlashList
        data={isSearch && !!search ? searchedParticipants : participants}
        renderItem={({item}: any) => {
          return (
            <TouchableOpacity
              onPress={() => {
                if (isDM) {
                  onUserClicked(item?.sdkClientInfo?.uuid);
                } else {
                  if (!selectedParticipants.includes(item?.id)) {
                    setSelectedParticipants([
                      ...selectedParticipants,
                      item?.id,
                    ]);
                  } else {
                    const filteredArr = selectedParticipants.filter(
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
                    item?.imageUrl
                      ? {uri: item?.imageUrl}
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
                  {item?.customTitle ? (
                    <Text
                      style={
                        styles.messageCustomTitle
                      }>{` • ${item?.customTitle}`}</Text>
                  ) : null}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        extraData={{
          value: [searchedParticipants, participants, selectedParticipants],
        }}
        estimatedItemSize={15}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => item?.id?.toString()}
      />
      {isSearch && isEmptyMessageShow && searchedParticipants?.length === 0 && (
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
      {count > 0 && <LoaderComponent />}
    </View>
  );
};

export default CommonAllMembers;
