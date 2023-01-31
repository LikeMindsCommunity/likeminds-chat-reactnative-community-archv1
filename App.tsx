import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import HomeFeed from './screens/HomeFeed';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ExploreFeed from './screens/ExploreFeed';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='ExploreFeed'>
        <Stack.Screen name="HomeFeed" component={HomeFeed} />
        <Stack.Screen name="ExploreFeed" component={ExploreFeed} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
