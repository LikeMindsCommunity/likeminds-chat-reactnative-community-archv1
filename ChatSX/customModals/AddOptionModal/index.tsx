import React from 'react';

import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {Modal, Pressable} from 'react-native';
import {
  ADD_NEW_POLL_OPTION,
  NEW_POLL_OPTION_TEXT,
  SUBMIT_TEXT,
} from '../../constants/Strings';
import {styles} from '../../components/Poll/styles';

const AddOptionsModal = ({
  isAddPollOptionModalVisible,
  setIsAddPollOptionModalVisible,
  addOptionInputField,
  setAddOptionInputField,
  handelAddOptionSubmit,
}: any) => {
  const handleModalClose = () => {
    setIsAddPollOptionModalVisible(false);
    setAddOptionInputField('');
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isAddPollOptionModalVisible}
      onRequestClose={() => {
        handleModalClose();
      }}>
      <Pressable style={styles.centeredView} onPress={handleModalClose}>
        <View style={styles.addOptionsModalViewParent}>
          <Pressable onPress={() => {}} style={[styles.modalView]}>
            <View style={styles.alignModalElements}>
              <AddOptionUI
                setIsAddPollOptionModalVisible={setIsAddPollOptionModalVisible}
                addOptionInputField={addOptionInputField}
                setAddOptionInputField={setAddOptionInputField}
                handelAddOptionSubmit={handelAddOptionSubmit}
                handleModalClose={handleModalClose}
              />
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

{
  /* Add more options in poll modal UI */
}
const AddOptionUI = ({
  hue,
  addOptionInputField,
  setAddOptionInputField,
  setIsAddPollOptionModalVisible,
  handelAddOptionSubmit,
  handleModalClose,
}: any) => {
  return (
    <View>
      <View style={styles.padding20}>
        <TouchableOpacity
          onPress={handleModalClose}
          style={[{alignSelf: 'flex-end'}]}>
          <Image
            style={[styles.pollIcon, {tintColor: styles.blackColor.color}]}
            source={require('../../assets/images/cross_icon3x.png')}
          />
        </TouchableOpacity>
        <View>
          <Text style={[styles.boldText, styles.blackColor]}>
            {ADD_NEW_POLL_OPTION}
          </Text>
          <Text
            style={[styles.smallText, styles.greyColor, styles.marginSpace]}>
            {NEW_POLL_OPTION_TEXT}
          </Text>
        </View>
        <View style={styles.extraMarginSpace}>
          <TextInput
            value={addOptionInputField}
            onChangeText={setAddOptionInputField}
            placeholder={'Type new option'}
            placeholderTextColor="#c5c5c5"
            style={styles.textInput}
          />
        </View>
        <View style={styles.extraMarginSpace}>
          <TouchableOpacity
            onPress={handelAddOptionSubmit}
            style={[
              styles.submitButton,
              hue ? {backgroundColor: `hsl(${hue}, 47%, 31%)`} : null,
            ]}>
            <Text
              style={[
                styles.mediumBoldText,
                styles.whiteColor,
                styles.textAlignCenter,
              ]}>
              {SUBMIT_TEXT}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AddOptionsModal;
