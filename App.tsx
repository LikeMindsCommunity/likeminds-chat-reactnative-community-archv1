import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeFeed from './screens/HomeFeed';

function App(): JSX.Element {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: 'red' }}>
      <HomeFeed />
    </SafeAreaProvider>
  );
}

export default App;
