import React from 'react';
import {KeyboardAvoidingView, Platform} from 'react-native';
import HomeFeed from './screens/HomeFeed';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ExploreFeed from './screens/ExploreFeed';
import ChatRoom from './screens/ChatRoom';
import {Provider as ReduxProvider} from 'react-redux';
import store from './store';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <ReduxProvider store={store}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="HomeFeed">
            <Stack.Screen name="HomeFeed" component={HomeFeed} />
            <Stack.Screen name="ExploreFeed" component={ExploreFeed} />
            <Stack.Screen name="ChatRoom" component={ChatRoom} />
          </Stack.Navigator>
        </NavigationContainer>
      </KeyboardAvoidingView>
    </ReduxProvider>
  );
}

export default App;
