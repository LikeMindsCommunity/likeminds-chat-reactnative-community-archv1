import {View, Text, Modal, Pressable, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from '../styles';
import {
  APPROVE_BUTTON,
  APPROVE_DM_REQUEST,
  APPROVE_REQUEST_MESSAGE,
  CANCEL_BUTTON,
} from '../../constants/Strings';

const ApproveDMRequestModal = ({
  hideDMApproveAlert,
  DMApproveAlertModalVisible,
  onApprove,
}: any) => {
  return (
    <Modal
      visible={DMApproveAlertModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={hideDMApproveAlert}>
      <Pressable style={styles.modal} onPress={hideDMApproveAlert}>
        <Pressable onPress={() => {}} style={styles.modalContainer}>
          <Text style={styles.title}>{APPROVE_DM_REQUEST}</Text>
          <Text style={styles.message}>{APPROVE_REQUEST_MESSAGE}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={hideDMApproveAlert}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {CANCEL_BUTTON}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.okButton]}
              onPress={() => {
                onApprove();
                hideDMApproveAlert();
              }}>
              <Text style={styles.buttonText}>{APPROVE_BUTTON}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ApproveDMRequestModal;
