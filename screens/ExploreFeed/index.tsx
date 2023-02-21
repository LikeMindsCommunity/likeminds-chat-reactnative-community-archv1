import React, {useState, useLayoutEffect, useRef, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import {dummyData} from '../../assets/dummyResponse/dummyData';
import ExploreFeedFilters from '../../components/ExploreFeedFilters';
import ExploreFeedItem from '../../components/ExploreFeedItem';
import ToastMessage from '../../components/ToastMessage';
import STYLES from '../../constants/Styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {getExploreFeedData} from '../../store/actions/explorefeed';
import styles from './styles';

interface Props {
  navigation: any;
}

const ExploreFeed = ({navigation}: Props) => {
  const [chats, setChats] = useState(dummyData.my_chatrooms);
  const [filterState, setFilterState] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const {exploreChatrooms = []} = useAppSelector(state => state.explorefeed);
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
  useEffect(() => {
    async function fetchData() {
      // let payload = {chatroomID: 69285, page: 1000};
      let payload = {
        community_id: 50421,
        order_type: filterState,
        page: 1,
      };
      let response = await dispatch(getExploreFeedData(payload) as any);
      console.log('getExploreFeedData API -=', response);
    }
    fetchData();
  }, [filterState]);

  return (
    <View style={styles.page}>
      <FlatList
        data={exploreChatrooms}
        // data={chats}
        ListHeaderComponent={() => (
          <ExploreFeedFilters
            filterState={filterState}
            setFilterState={val => {
              setFilterState(val);
            }}
            setIsPinned={(val)=>{setIsPinned(val)}}
            isPinned={isPinned}
          />
        )}
        renderItem={({item}) => {
          const exploreFeedProps = {
            // title: item?.chatroom?.title!,
            title: item?.title!,
            avatar: item?.chatroom_image_url,
            lastMessage: item?.last_conversation?.answer_text!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            isJoined: item?.member_can_message,
            pinned: item?.is_pinned,
          };
          return (
            <View>
              <ExploreFeedItem {...exploreFeedProps} />
            </View>
          );
        }}
        keyExtractor={item => item?.id.toString()}
      />
    </View>
  );
};

export default ExploreFeed;
