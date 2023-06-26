import React, {useState, useLayoutEffect, useRef, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import ExploreFeedFilters from '../../components/ExploreFeedFilters';
import ExploreFeedItem from '../../components/ExploreFeedItem';
import ToastMessage from '../../components/ToastMessage';
import STYLES from '../../constants/Styles';
import {useAppDispatch, useAppSelector} from '../../../store';
import {
  getExploreFeedData,
  updateExploreFeedData,
} from '../../store/actions/explorefeed';
import {SET_EXPLORE_FEED_PAGE} from '../../store/types/types';
import styles from './styles';
import {FlashList} from '@shopify/flash-list';

interface Props {
  navigation: any;
}

const ExploreFeed = ({navigation}: Props) => {
  // const [chats, setChats] = useState(dummyData.my_chatrooms);
  const {exploreChatrooms = [], page}: any = useAppSelector(
    state => state.explorefeed,
  );
  const {community}: any = useAppSelector(state => state.homefeed);
  const [chats, setChats] = useState(exploreChatrooms);
  const [filterState, setFilterState] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  // const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity onPress={navigation.goBack}>
            <Image
              source={require('../../assets/images/back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity>
          <Text
            style={{
              color: STYLES.$COLORS.PRIMARY,
              fontSize: STYLES.$FONT_SIZES.XL,
              fontFamily: STYLES.$FONT_TYPES.BOLD,
            }}>
            Explore Chatrooms
          </Text>
        </View>
      ),
    });
  }, [navigation]);

  async function fetchData() {
    // let payload = {chatroomID: 69285, page: 1000};
    dispatch({type: SET_EXPLORE_FEED_PAGE, body: 1});
    let payload = {
      orderType: filterState,
      page: 1,
    };
    let response = await dispatch(getExploreFeedData(payload) as any);
    return response;
  }

  async function updateData(newPage: number) {
    let payload = {
      community_id: community?.id,
      order_type: filterState,
      page: newPage,
    };
    let response = await dispatch(updateExploreFeedData(payload) as any);
    return response;
  }

  useEffect(() => {
    fetchData();
  }, [filterState]);

  useEffect(() => {
    if (isPinned) {
      let pinnedChats = exploreChatrooms.filter((item: any) =>
        !!item?.is_pinned ? item : null,
      );
      setChats(pinnedChats);
    } else {
      setChats(exploreChatrooms);
    }
  }, [exploreChatrooms]);

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    const res = await updateData(newPage);
    if (!!res) {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading) {
      if (chats.length > 0 && chats.length % 10 === 0) {
        // Alert.alert(`${page} handleLoadMore`)
        const newPage = page + 1;
        dispatch({type: SET_EXPLORE_FEED_PAGE, body: newPage});
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
      <FlashList
        data={chats}
        ListHeaderComponent={() => (
          <ExploreFeedFilters
            filterState={filterState}
            setFilterState={val => {
              setFilterState(val);
            }}
            setIsPinned={val => {
              if (!!val) {
                let pinnedChats = chats.filter((item: any) =>
                  !!item?.is_pinned ? item : null,
                );
                setChats(pinnedChats);
                setIsPinned(val);
              } else {
                setChats(exploreChatrooms);
                setIsPinned(val);
              }
            }}
            isPinned={isPinned}
          />
        )}
        renderItem={({item}: any) => {
          const exploreFeedProps = {
            // title: item?.chatroom?.title!,
            header: item?.header,
            title: item?.title!,
            avatar: item?.chatroom_image_url,
            lastMessage: item?.last_conversation?.answer_text!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            isJoined: item?.follow_status,
            pinned: item?.is_pinned,
            participants: item?.participants_count,
            messageCount: item?.total_response_count,
            external_seen: item?.external_seen,
            isSecret: item?.is_secret,
            chatroomID: item?.id,
            filterState: filterState,
            navigation: navigation,
          };
          return (
            <View>
              <ExploreFeedItem {...exploreFeedProps} />
            </View>
          );
        }}
        extraData={{
          value: [filterState, chats, exploreChatrooms, isPinned],
        }}
        estimatedItemSize={15}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => (item?.id ? item?.id.toString() : null)}
      />
    </View>
  );
};

export default ExploreFeed;
