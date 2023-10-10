import {View, Text, Modal, Pressable, TouchableOpacity} from 'react-native';
import React from 'react';
import {
  CANCEL_BUTTON,
  CONFIRM_BUTTON,
  DM_REQUEST_MESSAGE,
  SEND_DM_REQUEST,
} from '../../constants/Strings';
import {styles} from '../styles';

const SendDMRequestModal = ({
  hideDMSentAlert,
  DMSentAlertModalVisible,
  onSend,
  message,
}: any) => {
  return (
    <Modal
      visible={DMSentAlertModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={hideDMSentAlert}>
      <Pressable style={styles.modal} onPress={hideDMSentAlert}>
        <Pressable onPress={() => {}} style={styles.modalContainer}>
          <Text style={styles.title}>{SEND_DM_REQUEST}</Text>
          <Text style={styles.message}>{DM_REQUEST_MESSAGE}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={hideDMSentAlert}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {CANCEL_BUTTON}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.okButton]}
              onPress={() => {
                onSend(message);
                hideDMSentAlert();
              }}>
              <Text style={styles.buttonText}>{CONFIRM_BUTTON}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SendDMRequestModal;
