import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {View, Image, Text} from 'react-native';
import React, {useState} from 'react';
import {styles} from './styles';
import STYLES from '../../constants/Styles';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Layout from '../../constants/Layout';

export const PeopleWhoReacted = () => {
  return (
    <View style={styles.reactionItem}>
      <View style={styles.alignRow}>
        <View>
          <Image
            source={require('../../assets/images/default_pic.png')}
            style={styles.avatar}
          />
        </View>
        <View style={styles.alignColumn}>
          <Text style={styles.textHeading}>Jai Chaudhary</Text>
          <Text style={styles.text}>Tap to remove</Text>
        </View>
      </View>
      <View>
        <Text>😂</Text>
      </View>
    </View>
  );
};

const FirstRoute = () => (
  <View style={[styles.scene]}>
    <PeopleWhoReacted />
  </View>
);
const SecondRoute = () => (
  <View style={[styles.scene]}>
    <PeopleWhoReacted />
  </View>
);

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
  />
);

export default function MyTabs() {
  const [state, setState] = useState({
    index: 0,
    routes: [
      {key: 'first', title: 'All (1)'},
      {key: 'second', title: '😂'},
    ],
  });
  return (
    <TabView
      navigationState={state}
      renderTabBar={renderTabBar}
      renderScene={SceneMap({
        first: FirstRoute,
        second: SecondRoute,
      })}
      onIndexChange={index => setState({index, routes: state.routes})}
      initialLayout={{width: Layout.window.width}}
      style={styles.container}
    />
  );
}
