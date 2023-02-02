import React, {useState, useLayoutEffect, useRef} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {dummyData} from '../../assets/dummyResponse/dummyData';
import ExploreFeedFilters from '../../components/ExploreFeedFilters';
import ExploreFeedItem from '../../components/ExploreFeedItem';
import HomeFeedExplore from '../../components/HomeFeedExplore';
import STYLES from '../../constants/Styles';
import styles from './styles';

interface Props {
  navigation: any;
}

const ExploreFeed = ({navigation}: Props) => {
  const [chats, setChats] = useState(dummyData.data.my_chatrooms);
  const modalRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          <TouchableOpacity
            onPress={navigation.goBack}
            style={styles.backBtn}></TouchableOpacity>
          <Text
            style={{
              color: STYLES.$COLORS.PRIMARY,
              fontSize: STYLES.$FONT_SIZES.XL,
              fontFamily: STYLES.$FONT_TYPES.BOLD
            }}>
            Explore Chatrooms
          </Text>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View ref={modalRef} style={styles.page}>
      <FlatList
        data={chats}
        ListHeaderComponent={() => <ExploreFeedFilters />}
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
