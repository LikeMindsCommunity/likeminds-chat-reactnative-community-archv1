import React, {useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, Image} from 'react-native';
import {dummyData} from '../../assets/dummyData';
import HomeFeedItem from '../../components/HomeFeedItem';
import styles from './styles';

const HomeFeed = () => {
  const [chats, setChats] = useState(dummyData.data.my_chatrooms);

  return (
    <View style={styles.page}>
      <FlatList
        data={chats}
        renderItem={({item}) => {
          const homeFeedProps = {
            title: item?.chatroom?.title!,
            avatar: item?.chatroom?.chatroom_image_url!,
            lastMessage: item?.last_conversation?.answer!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            time: item?.last_conversation?.reply_conversation_object
              ?.created_epoch!,

            unreadCount: item?.unseen_conversation_count!,
            pinned: false,
          };
          return <HomeFeedItem {...homeFeedProps} />;
        }}
        keyExtractor={item => item.chatroom.id.toString()}
      />
    </View>
  );
};

export default HomeFeed;
