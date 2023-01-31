import React, {useState, useLayoutEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {dummyData} from '../../assets/dummyResponse/dummyData';
import ExploreFeedItem from '../../components/ExploreFeedItem';
import HomeFeedExplore from '../../components/HomeFeedExplore';
import STYLES from '../../constants/Styles';
import styles from './styles';

interface Props {
  navigation: any;
}

const ExploreFeed = ({navigation}: Props) => {
  const [chats, setChats] = useState(dummyData.data.my_chatrooms);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <TouchableOpacity>
          <Text
            style={{
              color: STYLES.$COLORS.PRIMARY,
              fontSize: STYLES.$FONT_SIZES.XL,
              fontWeight: STYLES.$FONT_WEIGHTS.BOLD,
            }}>
            Explore Chatrooms
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.page}>
      <FlatList
        data={chats}
        // ListHeaderComponent={() => <HomeFeedExplore newCount={5} />}
        renderItem={({item}) => {
          const exploreFeedProps = {
            title: item?.chatroom?.title!,
            avatar: item?.chatroom?.chatroom_image_url!,
            lastMessage: item?.last_conversation?.answer!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            join: false,
            pinned: false,
          };
          return <ExploreFeedItem {...exploreFeedProps} />;
        }}
        keyExtractor={item => item.chatroom.id.toString()}
      />
    </View>
  );
};

export default ExploreFeed;
