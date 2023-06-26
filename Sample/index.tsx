import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';
import {LikeMindsChatClient} from '..';

const FetchKeyInputScreen = () => {
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  const handleButtonPress = () => {
    // Perform some action when the button is pressed
    // You can access the input values from input1 and input2 variables

    let CHAT_CLIENT = new LikeMindsChatClient();
    CHAT_CLIENT.addApiKey(input1);
    console.log('Input 1:', input1);
    console.log('Input 2:', input2);
    AsyncStorage.setItem('apiKey', input1);
    AsyncStorage.setItem('userUniqueID', input2);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        value={input1}
        onChangeText={text => setInput1(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        value={input2}
        onChangeText={text => setInput2(text)}
      />
      <Button title="Press me" onPress={handleButtonPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default FetchKeyInputScreen;
