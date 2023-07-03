import {View, Text, Modal, Pressable, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from '../styles';
import {
  BLOCK_DM_REQUEST,
  CANCEL_BUTTON,
  CONFIRM_BUTTON,
} from '../../constants/Strings';

const BlockDMRequestModal = ({
  hideDMBlockAlert,
  DMBlockAlertModalVisible,
  blockMember,
  chatroomName,
}: any) => {
  return (
    <Modal
      visible={DMBlockAlertModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={hideDMBlockAlert}>
      <Pressable style={styles.modal} onPress={hideDMBlockAlert}>
        <Pressable onPress={() => {}} style={styles.modalContainer}>
          <Text style={styles.title}>{BLOCK_DM_REQUEST}</Text>
          <Text
            style={
              styles.message
            }>{`Are you sure you do not want to receive new messages from ${chatroomName}?`}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={hideDMBlockAlert}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {CANCEL_BUTTON}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.okButton]}
              onPress={() => {
                blockMember();
                hideDMBlockAlert();
              }}>
              <Text style={styles.buttonText}>{CONFIRM_BUTTON}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default BlockDMRequestModal;
