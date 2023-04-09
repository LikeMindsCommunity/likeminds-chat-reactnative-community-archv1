import {View, Image, Text, ScrollView} from 'react-native';
import React, {useLayoutEffect, useState} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Layout from '../../constants/Layout';

interface PeopleWhoReactedDefault {
  item: any;
  removeReaction: () => void;
}

interface PeopleWhoReacted {
  item: any;
  title: any;
  removeReaction: () => void;
}

export const PeopleWhoReactedDefault = ({
  item,
  removeReaction,
}: PeopleWhoReactedDefault) => {
  return (
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
                    !!val?.member?.image_url
                      ? {uri: val?.member?.image_url}
                      : require('../../assets/images/default_pic.png')
                  }
                  style={styles.avatar}
                />
              </View>
              <View style={styles.alignColumn}>
                <Text style={styles.textHeading}>{val?.member?.name}</Text>
                <Text
                  onPress={() => {
                    removeReaction();
                  }}
                  style={styles.text}>
                  Tap to remove
                </Text>
              </View>
            </View>
            <View>
              <Text>{val?.reaction}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

export const PeopleWhoReacted = ({
  item,
  title,
  removeReaction,
}: PeopleWhoReacted) => {
  return (
    <View>
      <ScrollView>
        {item?.map((val: any, index: any) => {
          return (
            <View key={val + index} style={styles.reactionItem}>
              <View style={styles.alignRow}>
                <View>
                  <Image
                    source={
                      !!val?.image_url
                        ? {uri: val?.image_url}
                        : require('../../assets/images/default_pic.png')
                    }
                    style={styles.avatar}
                  />
                </View>
                <View style={styles.alignColumn}>
                  <Text style={styles.textHeading}>{val?.name}</Text>
                  <Text
                    onPress={() => {
                      removeReaction();
                    }}
                    style={styles.text}>
                    Tap to remove
                  </Text>
                </View>
              </View>
              <View>
                <Text>{title}</Text>
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
  removeReaction: () => void;
}

export default function MyTabs({
  reactionArr,
  defaultReactionArr,
  removeReaction,
}: MyTabs) {
  const [state, setState] = useState({
    index: 0,
    routes: [{key: 'all', title: `All `, val: defaultReactionArr}],
  });
  useLayoutEffect(() => {
    let initialState = {
      index: 0,
      routes: [{key: 'all', title: `All `, val: defaultReactionArr}],
    };
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
              />
            );
          default:
            return (
              <PeopleWhoReacted
                title={route?.title}
                item={route?.val}
                removeReaction={removeReaction}
              />
            );
        }
      }}
      onIndexChange={index => setState({index, routes: state.routes})}
      initialLayout={{width: Layout.window.width}}
      style={styles.container}
      overScrollMode={'always'}
      // pagerStyle={{overflow: 'scroll', height: 150}}
      // sceneContainerStyle={{overflow:'scroll',height:150}}
    />
  );
}
