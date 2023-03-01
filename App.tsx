import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider as ReduxProvider} from 'react-redux';
import store, {useAppSelector} from './store';
import SwitchComponent from './navigation/SwitchComponent';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <ReduxProvider store={store}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
          <SwitchComponent />
      </KeyboardAvoidingView>
    </ReduxProvider>
  );
}

export default App;
