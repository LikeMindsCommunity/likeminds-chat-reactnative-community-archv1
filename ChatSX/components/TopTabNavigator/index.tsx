import {View, Image, Text, ScrollView, TouchableOpacity} from 'react-native';
import React, {useLayoutEffect, useState} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Layout from '../../constants/Layout';
import {useAppSelector} from '../../store';
import {Events, Keys} from '../../enums';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';

interface PeopleWhoReactedDefault {
  item: any;
  removeReaction: any;
  user: any;
}

interface PeopleWhoReacted {
  item: any;
  title: any;
  removeReaction: any;
  user: any;
}

export const PeopleWhoReactedDefault = ({
  item,
  removeReaction,
  user,
}: PeopleWhoReactedDefault) => {
  return (
    <View style={{height: '100%'}}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardDismissMode="on-drag">
        {item?.map((val: any, index: any) => {
          return (
            <View key={val + index} style={styles.reactionItem}>
              <View style={styles.alignRow}>
                <View>
                  <Image
                    source={
                      val?.member?.image_url
                        ? {uri: val?.member?.image_url}
                        : require('../../assets/images/default_pic.png')
                    }
                    style={styles.avatar}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    removeReaction(val?.member, false);
                  }}
                  style={styles.alignColumn}>
                  <Text style={styles.textHeading}>{val?.member?.name}</Text>
                  {val?.member?.id == user?.id ? (
                    <Text style={styles.text}>Tap to remove</Text>
                  ) : null}
                </TouchableOpacity>
                <View>
                  <Text style={styles.messageText}>{val?.reaction}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const PeopleWhoReacted = ({
  item,
  title,
  removeReaction,
  user,
}: PeopleWhoReacted) => {
  return (
    <View style={{height: '100%'}}>
      <ScrollView>
        {item?.map((val: any, index: any) => {
          return (
            <View key={val + index} style={styles.reactionItem}>
              <View style={styles.alignRow}>
                <View>
                  <Image
                    source={
                      val?.image_url
                        ? {uri: val?.image_url}
                        : require('../../assets/images/default_pic.png')
                    }
                    style={styles.avatar}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    removeReaction(val, true);
                  }}
                  style={styles.alignColumn}>
                  <Text style={styles.textHeading}>{val?.name}</Text>
                  {val?.id == user?.id ? (
                    <Text style={styles.text}>Tap to remove</Text>
                  ) : null}
                </TouchableOpacity>
                <View>
                  <Text style={styles.messageText}>{title}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const renderTabBar = (props: any) => (
  <TabBar
    {...props}
    tabStyle={{width: 70, color: STYLES.$COLORS.SECONDARY}}
    labelStyle={[
      styles.textHeading,
      {color: STYLES.$COLORS.LIGHT_BLUE, textTransform: 'capitalize'},
    ]}
    indicatorStyle={{backgroundColor: STYLES.$COLORS.SECONDARY}}
    style={{backgroundColor: 'white'}}
    scrollEnabled={true}
  />
);

interface MyTabs {
  reactionArr: any;
  defaultReactionArr: any;
  removeReaction: any;
  selectedReaction?: any;
  item: any;
  chatroomID: any;
}

export default function MyTabs({
  reactionArr,
  defaultReactionArr,
  removeReaction,
  selectedReaction,
  item,
  chatroomID,
}: MyTabs) {
  const {user} = useAppSelector(state => state.homefeed);
  const index = reactionArr.findIndex(
    (val: any) => val?.reaction === selectedReaction,
  );
  const [state, setState] = useState({
    index: index >= 0 && selectedReaction ? index + 1 : 0,
    routes: [{key: 'all', title: 'All ', val: defaultReactionArr}],
  });

  useLayoutEffect(() => {
    const initialState = {
      index: 0,
      routes: [{key: 'all', title: 'All ', val: defaultReactionArr}],
    };
    LMChatAnalytics.track(
      Events.REACTION_LIST_OPENED,
      new Map<string, string>([
        [Keys.MESSAGE_ID, item?.id],
        [Keys.CHATROOM_ID, chatroomID?.toString()],
      ]),
    );
    if (reactionArr.length > 0) {
      for (let i = 0; i < reactionArr.length; i++) {
        initialState.routes = [
          ...initialState.routes,
          {
            key: reactionArr[i].reaction,
            title: reactionArr[i].reaction,
            val: reactionArr[i].memberArr,
          },
        ];
      }
      setState(initialState as any);
    } else {
      setState(initialState as any);
    }
  }, [reactionArr]);

  return (
    <TabView
      navigationState={state}
      renderTabBar={renderTabBar}
      renderScene={({route}) => {
        switch (route.key) {
          case 'all':
            return (
              <PeopleWhoReactedDefault
                item={defaultReactionArr}
                removeReaction={removeReaction}
                user={user}
              />
            );
          default:
            return (
              <PeopleWhoReacted
                title={route?.title}
                item={route?.val}
                removeReaction={removeReaction}
                user={user}
              />
            );
        }
      }}
      onIndexChange={index => setState({index, routes: state.routes})}
      initialLayout={{width: Layout.window.width}}
      style={styles.container}
      overScrollMode={'always'}
      animationEnabled={true}
      swipeEnabled={true}
      // pagerStyle={{overflow: 'scroll', height: 150}}
      // sceneContainerStyle={{overflow:'scroll',height:150}}
    />
  );
}
