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
import {useAppDispatch} from '../../store';

const AddParticipants = ({navigation, route}: any) => {
  const [participants, setParticipants] = useState([] as any);
  const [searchedParticipants, setSearchedParticipants] = useState([] as any);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([] as any);

  const {chatroomID, isSecret} = route.params;
  const dispatch = useAppDispatch();

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
            // numberOfLines={6}
            // multiline={true}
            // onBlur={() => {
            //   setIsKeyBoardFocused(false);
            // }}
            // onFocus={() => {
            //   setIsKeyBoardFocused(true);
            // }}
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
    const delay = setTimeout(() => {
      if (isSearch) {
        searchParticipants();
      } else {
        fetchParticipants();
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    // setInitialHeader();
    if (!isSearch) {
      setInitialHeader();
    }
  }, [selectedParticipants]);

  useEffect(() => {
    // setInitialHeader();
    if (!!isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [isSearch]);

  const fetchParticipants = async () => {
    const res = await myClient.getAllMembers({page: 1});
    setParticipants(res?.members);
  };

  const searchParticipants = async () => {
    const res = await myClient.searchMembers({
      search: search,
      search_type: 'name',
      page: searchPage,
      page_size: 10,
    });
    setSearchedParticipants(res?.members);
  };

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
      const res = await myClient.getAllMembers({page: newPage});
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
        arr?.length % 10 === 0 &&
        arr?.length > 0 &&
        arr?.length === 10 * page
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

  return (
    <View style={styles.page}>
      <FlatList
        data={isSearch ? searchedParticipants : participants}
        renderItem={({item}: any) => {
          return (
            <TouchableOpacity
              onPress={() => {
                if (!selectedParticipants.includes(item?.id)) {
                  setSelectedParticipants([...selectedParticipants, item?.id]);
                } else {
                  let filteredArr = selectedParticipants.filter((val: any) => {
                    return val !== item?.id;
                  });
                  setSelectedParticipants([...filteredArr]);
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
                {selectedParticipants.includes(item?.id) ? (
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
    </View>
  );
};

export default AddParticipants;
