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
import {useAppDispatch, useAppSelector} from '../../store';
import {
  getExploreFeedData,
  updateExploreFeedData,
} from '../../store/actions/explorefeed';
import {SET_EXPLORE_FEED_PAGE} from '../../store/types/types';
import styles from './styles';
import {FlashList} from '@shopify/flash-list';
import {LoaderComponent} from '../../components/LoaderComponent';

interface Props {
  navigation: any;
}

const ExploreFeed = ({navigation}: Props) => {
  const {
    exploreChatrooms = [],
    page,
    pinnedChatroomsCount,
  }: any = useAppSelector(state => state.explorefeed);
  const {community}: any = useAppSelector(state => state.homefeed);
  const [chats, setChats] = useState(exploreChatrooms);
  const [filterState, setFilterState] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  // const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const {count} = useAppSelector(state => state.loader);
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
    const payload = {
      orderType: filterState,
      page: 1,
    };
    const response = await dispatch(getExploreFeedData(payload, true) as any);
    return response;
  }

  async function updateData(newPage: number) {
    const payload = {
      orderType: filterState,
      page: newPage,
    };
    const response = await dispatch(updateExploreFeedData(payload) as any);
    return response;
  }

  useEffect(() => {
    fetchData();
  }, [filterState]);

  useEffect(() => {
    if (isPinned) {
      const pinnedChats = exploreChatrooms.filter((item: any) =>
        item?.isPinned ? item : null,
      );
      setChats(pinnedChats);
    } else {
      setChats(exploreChatrooms);
    }
  }, [exploreChatrooms]);

  const loadData = async (newPage: number) => {
    setIsLoading(true);
    const res = await updateData(newPage);
    if (res) {
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
              if (val) {
                const pinnedChats = chats.filter((item: any) =>
                  item?.isPinned ? item : null,
                );
                setChats(pinnedChats);
                setIsPinned(val);
              } else {
                setChats(exploreChatrooms);
                setIsPinned(val);
              }
            }}
            isPinned={isPinned}
            pinnedChatroomsCount={pinnedChatroomsCount}
          />
        )}
        renderItem={({item}: any) => {
          const exploreFeedProps = {
            header: item?.header,
            title: item?.title!,
            avatar: item?.chatroomImageUrl,
            lastMessage: item?.lastConversation?.answerText!,
            lastMessageUser: item?.lastConversation?.member?.name!,
            isJoined: item?.followStatus,
            pinned: item?.isPinned,
            participants: item?.participantsCount,
            messageCount: item?.totalResponseCount,
            externalSeen: item?.externalSeen,
            isSecret: item?.isSecret,
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
        keyExtractor={(item: any) => (item?.id ? item?.id?.toString() : null)}
      />
      {count > 0 && <LoaderComponent />}
    </View>
  );
};

export default ExploreFeed;
