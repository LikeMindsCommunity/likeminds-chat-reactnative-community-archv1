import React, {useState, useLayoutEffect, useEffect} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import {myClient} from '../..';
import {dummyData} from '../../assets/dummyResponse/dummyData';
import HomeFeedExplore from '../../components/HomeFeedExplore';
import HomeFeedItem from '../../components/HomeFeedItem';
import STYLES from '../../constants/Styles';
import useAPI from '../../hooks/useAPI';
import styles from './styles';

interface Props {
  navigation: any;
}

const HomeFeed = ({navigation}: Props) => {
  const [chats, setChats] = useState(dummyData.my_chatrooms);

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
              fontFamily: STYLES.$FONT_TYPES.BOLD,
            }}>
            Community
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{
            width: 35,
            height: 35,
            borderRadius: STYLES.$AVATAR.BORDER_RADIUS,
            backgroundColor: 'purple',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: STYLES.$COLORS.TERTIARY,
              fontSize: STYLES.$FONT_SIZES.XL,
              fontFamily: STYLES.$FONT_TYPES.SEMI_BOLD,
              paddingTop: 3,
            }}>
            R
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    async function fetchData() {
      try {
        let payload = {
          user_unique_id: '780cfe5e-1605-49ee-b8a0-c79deaaf77bf',
          user_name: '',
          is_guest: false,
        };
        let res = await myClient.initSDK(payload);
        

        // if(res){
        //   let response = await myClient.getHomeFeedData({
        //     communityId: '1234',
        //     page: 0,
        //   });
        //   console.log('respose -=', response);
        // }
        
        return res;
      } catch (error) {
        console.log('Yes Err!', error);
      }
    }
    fetchData();
  }, []);

  // let {response} = useAPI({func: myClient?.initSDK, payload});
  // console.log('res =',response);

  return (
    <View style={styles.page}>
      <FlatList
        data={chats}
        ListHeaderComponent={() => (
          <HomeFeedExplore newCount={5} navigation={navigation} />
        )}
        renderItem={({item}) => {
          const homeFeedProps = {
            title: item?.chatroom?.title!,
            avatar: item?.chatroom?.image_url_round!,
            lastMessage: item?.last_conversation?.answer!,
            lastMessageUser: item?.last_conversation?.member?.name!,
            time: item?.last_conversation?.reply_conversation_object
              ?.created_epoch!,

            unreadCount: item?.unseen_conversation_count!,
            pinned: false,
            lastConversation: item?.last_conversation,
          };
          return <HomeFeedItem {...homeFeedProps} />;
        }}
        keyExtractor={item => item.chatroom.id.toString()}
      />
    </View>
  );
};

export default HomeFeed;
