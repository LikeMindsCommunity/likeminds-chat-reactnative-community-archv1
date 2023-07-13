import {View, Text, Modal, Pressable, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from '../styles';
import {CONFIRM_BUTTON, CANCEL_BUTTON} from '../../constants/Strings';

const WarningMessageModal = ({
  hideWarningModal,
  warningMessageModalState,
  warningMessage,
  leaveChatroom,
}: any) => {
  return (
    <Modal
      visible={warningMessageModalState}
      animationType="fade"
      transparent={true}
      onRequestClose={hideWarningModal}>
      <Pressable style={styles.modal} onPress={hideWarningModal}>
        <Pressable onPress={() => {}} style={styles.modalContainer}>
          <Text style={styles.message}>{warningMessage}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={hideWarningModal}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {CANCEL_BUTTON}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.okButton]}
              onPress={() => {
                leaveChatroom();
                hideWarningModal();
              }}>
              <Text style={styles.buttonText}>{CONFIRM_BUTTON}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WarningMessageModal;
