import {View, Text, Image, Alert, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import styles from './styles';
import STYLES from '../../constants/Styles';
import {FlashList} from '@shopify/flash-list';
import {NO_RESPONSES, POLL_RESULT_TEXT} from '../../constants/Strings';
import {myClient} from '../../..';

const PollStack = createMaterialTopTabNavigator();

const PollResult = ({navigation, route}: any) => {
  const {tabsValueArr = [], conversationID} = route.params;

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
          <View style={styles.chatRoomInfo}>
            <Text
              style={{
                color: STYLES.$COLORS.PRIMARY,
                fontSize: STYLES.$FONT_SIZES.LARGE,
                fontFamily: STYLES.$FONT_TYPES.BOLD,
              }}>
              {POLL_RESULT_TEXT}
            </Text>
          </View>
        </View>
      ),
    });
  };

  useEffect(() => {
    setInitialHeader();
  }, []);

  return (
    <View
      style={{
        flex: 1,
      }}>
      <PollStack.Navigator
        screenOptions={{
          tabBarLabelStyle: styles.font,
          tabBarIndicatorStyle: {backgroundColor: STYLES.$COLORS.PRIMARY},
          tabBarScrollEnabled: tabsValueArr.length < 3 ? false : true,
        }}>
        {tabsValueArr?.map((val: any, index: any) => {
          return (
            <PollStack.Screen
              key={val?.id}
              name={val?.text}
              children={(props: any) => (
                <TabScreenUI
                  pollID={val?.id}
                  conversationID={conversationID}
                  {...props}
                />
              )}
              options={{
                tabBarLabel: ({focused}) => (
                  <View>
                    <Text
                      style={[
                        styles.font,
                        {
                          color: focused
                            ? STYLES.$COLORS.PRIMARY
                            : STYLES.$COLORS.MSG,
                          textAlign: 'center',
                        },
                      ]}>
                      {val?.noVotes}
                    </Text>
                    <Text
                      style={[
                        styles.font,
                        {
                          color: STYLES.$COLORS.MSG,
                          marginTop: 5,
                        },
                      ]}>
                      {val?.text}
                    </Text>
                  </View>
                ),
              }}
            />
          );
        })}
      </PollStack.Navigator>
    </View>
  );
};

const TabScreenUI = ({pollID, conversationID}: any) => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchPollUsers(pollID);
  }, []);
  const fetchPollUsers = async (pollID?: string) => {
    const payload: any = {
      pollId: pollID,
      conversationId: conversationID,
    };

    const res: any = await myClient.getPollUsers({
      pollId: parseInt(pollID!),
      conversationId: conversationID,
    });

    if (res?.success) {
      setUsers(res?.data?.members);
    }
  };

  return (
    <View style={styles.page}>
      {users.length < 1 ? (
        <View style={styles.nothingDM}>
          <View style={[styles.justifyCenter]}>
            <Image
              style={styles.nothingImg}
              source={require('../../assets/images/nothing3x.png')}
            />
            <Text style={styles.title}>{NO_RESPONSES}</Text>
          </View>
        </View>
      ) : (
        <FlashList
          data={users}
          estimatedItemSize={1}
          renderItem={({item}: any) => {
            return (
              <View key={item?.id} style={styles.participants}>
                <Image
                  source={
                    item?.imageUrl
                      ? {uri: item?.imageUrl}
                      : require('../../assets/images/default_pic.png')
                  }
                  style={styles.avatar}
                />
                <View style={styles.gap}>
                  <View>
                    <Text style={styles.title} numberOfLines={1}>
                      {item?.name}
                      {item?.customTitle ? (
                        <Text
                          style={
                            styles.messageCustomTitle
                          }>{` • ${item?.customTitle}`}</Text>
                      ) : null}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.secondaryTitle]} numberOfLines={1}>
                      {item?.memberSince}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          // onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          // ListFooterComponent={renderFooter}
          keyExtractor={(item: any) => item?.id?.toString()}
        />
      )}
    </View>
  );
};

export default PollResult;
