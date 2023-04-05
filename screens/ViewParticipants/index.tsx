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
import { useAppSelector } from '../../store';

const ViewParticipants = ({navigation, route}: any) => {
  const [participants, setParticipants] = useState({} as any);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isSearch, setIsSearch] = useState(false);
  const [search, setSearch] = useState('');

  const {chatroomID, isSecret} = route.params;
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
          {!(Object.keys(!!participants ? participants : 0).length === 0) ? (
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
                {`${participants.length} participants`}
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

  const fetchParticipants = async () => {
    const res = await myClient.viewParticipants({
      chatroom_id: chatroomID,
      is_secret: isSecret,
      page: 1,
      page_size: 50,
      participant_name: search,
    });
    setParticipants(res?.participants);
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
      fetchParticipants();
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    // setInitialHeader();
    if (!!isSearch) {
      setSearchHeader();
    } else {
      setInitialHeader();
    }
  }, [isSearch]);

  async function updateData(newPage: number) {
    let payload = {
      chatroom_id: chatroomID,
      is_secret: isSecret,
      page: newPage,
      page_size: 50,
      participant_name: search,
    };
    let response = myClient.viewParticipants(payload);
    return response;
  }

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    setTimeout(async () => {
      const res = await updateData(newPage);
      if (!!res) {
        setParticipants([...participants, res?.participants]);
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleLoadMore = async () => {
    if (!isLoading) {
      let arr = participants;
      if (
        arr?.length % 10 === 0 &&
        arr?.length > 0 &&
        arr?.length === 50 * page
      ) {
        let newPage = page + 1;
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
      <FlatList
        data={participants}
        ListHeaderComponent={() =>
          (isSecret && user?.state === 1) ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('AddParticipants', {
                  chatroomID: chatroomID,
                  isSecret: isSecret,
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
                  backgroundColor: '#4c4edc',
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
                  !!item?.image_url
                    ? {uri: item?.image_url}
                    : require('../../assets/images/default_pic.png')
                }
                style={styles.avatar}
              />
              <View style={styles.infoContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {item?.name}
                </Text>
              </View>
            </View>
          );
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => item?.id.toString()}
      />
    </View>
  );
};

export default ViewParticipants;
