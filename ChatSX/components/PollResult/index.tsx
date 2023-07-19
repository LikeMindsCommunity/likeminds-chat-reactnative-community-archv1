import {View, Text, Image, Alert, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import styles from './styles';
import STYLES from '../../constants/Styles';
import {FlashList} from '@shopify/flash-list';
import {POLL_RESULT_TEXT} from '../../constants/Strings';

const Tab = createMaterialTopTabNavigator();

const PollResult = ({navigation}: any) => {
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
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: styles.font,
          tabBarIndicatorStyle: {backgroundColor: STYLES.$COLORS.PRIMARY},
          tabBarScrollEnabled: true,
        }}>
        <Tab.Screen
          name={'Sketch'}
          options={{
            tabBarLabel: ({focused}) => (
              <Text
                style={[
                  styles.font,
                  {
                    color: focused
                      ? STYLES.$COLORS.PRIMARY
                      : STYLES.$COLORS.MSG,
                  },
                ]}>
                Groups
              </Text>
            ),
          }}
          component={TabScreenUI}
        />
        <Tab.Screen
          name={'Adobe'}
          options={{tabBarLabel: 'DMs'}}
          component={TabScreenUI}
        />
        <Tab.Screen
          name={'Figma'}
          options={{tabBarLabel: 'DMs'}}
          component={TabScreenUI}
        />
        <Tab.Screen
          name={'smdh'}
          options={{tabBarLabel: 'DMs'}}
          component={TabScreenUI}
        />
      </Tab.Navigator>
    </View>
  );
};

const TabScreenUI = () => {
  return (
    <View style={styles.page}>
      <FlashList
        data={[
          {
            custom_intro_text: 'Created this community on 09 May 2023',
            custom_title: 'Owner',
            id: 88738,
            image_url: '',
            is_guest: false,
            is_owner: true,
            member_since: 'Member since May 09 2023',
            member_since_epoch: 1683627214,
            name: 'NewDM bot',
            organisation_name: null,
            route:
              'route://member_community_profile?community_id=50506&member_id=88738',
            state: 1,
            updated_at: 1683692723,
            user_unique_id: 'fae1b9e9-75b3-4902-a5a1-4ca71acaee47',
            uuid: 'fae1b9e9-75b3-4902-a5a1-4ca71acaee47',
          },
        ]}
        // extraData={{
        //   value: [user, participants, isSecret],
        // }}
        estimatedItemSize={1}
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
                  {!!item?.custom_title ? (
                    <Text
                      style={
                        styles.messageCustomTitle
                      }>{` • ${item?.custom_title}`}</Text>
                  ) : null}
                </Text>
              </View>
            </View>
          );
        }}
        // onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        // ListFooterComponent={renderFooter}
        keyExtractor={(item: any) => item?.id.toString()}
      />
      {/* {participants?.length === 0 && (
        <View style={[styles.justifyCenter]}>
          <Text style={styles.title}>No search results found</Text>
        </View>
      )} */}
    </View>
  );
};

export default PollResult;
