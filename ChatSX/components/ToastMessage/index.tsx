import {View, Text, Modal} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import Layout from '../../constants/Layout';

interface Props {
  message: string;
  isToast: boolean;
  onDismiss: () => void;
}

const ToastMessage = ({isToast, onDismiss, message}: Props) => {
  useEffect(() => {
    if (isToast) {
      setTimeout(() => {
        onDismiss();
      }, 2000);
    }
  }, [isToast]);

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isToast}
        onRequestClose={() => {
          onDismiss();
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalParent}>
            <View style={styles.modalView}>
              <Text style={styles.filterText}>{message}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ToastMessage;
