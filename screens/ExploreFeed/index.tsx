import React, {useState, useLayoutEffect, useRef} from 'react';
import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import {dummyData} from '../../assets/dummyResponse/dummyData';
import ExploreFeedFilters from '../../components/ExploreFeedFilters';
import ExploreFeedItem from '../../components/ExploreFeedItem';
import ToastMessage from '../../components/ToastMessage';
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

  return (
    <View style={styles.page}>
      <FlatList
        data={chats}
        ListHeaderComponent={() => <ExploreFeedFilters isPinned={false} />}
        renderItem={({item}) => {
          const exploreFeedProps = {
            title: item?.chatroom?.title!,
            avatar: item?.chatroom?.chatroom_image_url!,
            lastMessage: item?.last_conversation?.answer!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            isJoined: false,
            pinned: false,
          };
          return (
            <View>
              <ExploreFeedItem {...exploreFeedProps} />
            </View>
          );
        }}
        keyExtractor={item => item.chatroom.id.toString()}
      />
    </View>
  );
};

export default ExploreFeed;
