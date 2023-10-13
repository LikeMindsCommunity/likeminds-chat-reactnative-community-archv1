import {View, Text, Modal, Pressable, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from '../styles';
import {
  REJECT_BUTTON,
  REJECT_DM_REQUEST,
  REJECT_REQUEST_MESSAGE,
  REPORT_AND_REJECT_BUTTON,
} from '../../constants/Strings';
import {REPORT} from '../../constants/Screens';
import {ChatroomChatRequestState} from '../../enums';
import {ChatroomType} from '../../enums';

const RejectDMRequestModal = ({
  hideDMRejectAlert,
  DMRejectAlertModalVisible,
  onReject,
  navigation,
  chatroomID,
  chatroomType,
}: any) => {
  return (
    <Modal
      visible={DMRejectAlertModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={hideDMRejectAlert}>
      <Pressable style={styles.modal} onPress={hideDMRejectAlert}>
        <Pressable onPress={() => {}} style={styles.modalContainer}>
          <Text style={styles.title}>{REJECT_DM_REQUEST}</Text>
          <Text style={styles.message}>{REJECT_REQUEST_MESSAGE}</Text>
          <View style={styles.rejectButtonContainer}>
            <TouchableOpacity
              style={[styles.rejectButton, styles.cancelButton]}
              onPress={() => {
                onReject();
                hideDMRejectAlert();
              }}>
              <Text style={[styles.buttonText]}>{REJECT_BUTTON}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, styles.cancelButton]}
              onPress={hideDMRejectAlert}>
              <Text style={[styles.buttonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, styles.okButton]}
              onPress={() => {
                onReject();
                navigation.navigate(REPORT, {
                  conversationID: chatroomID,
                  isDM: chatroomType === ChatroomType.DMCHATROOM ? true : false,
                });
                hideDMRejectAlert();
              }}>
              <Text style={styles.buttonText}>{REPORT_AND_REJECT_BUTTON}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default RejectDMRequestModal;
