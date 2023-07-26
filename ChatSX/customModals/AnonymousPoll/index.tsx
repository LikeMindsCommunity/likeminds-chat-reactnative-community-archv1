import {View, Text, Modal, Pressable, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from '../styles';
import {CONFIRM_BUTTON, CANCEL_BUTTON, OKAY} from '../../constants/Strings';

const AnonymousPollModal = ({
  hideAnonymousPollModal,
  isAnonymousPollModalVisible,
  title,
  subTitle,
}: any) => {
  return (
    <Modal
      visible={isAnonymousPollModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={hideAnonymousPollModal}>
      <Pressable style={styles.modal} onPress={hideAnonymousPollModal}>
        <Pressable onPress={() => {}} style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{subTitle}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.okButton]}
              onPress={() => {
                hideAnonymousPollModal();
              }}>
              <Text style={styles.buttonText}>{OKAY}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AnonymousPollModal;
