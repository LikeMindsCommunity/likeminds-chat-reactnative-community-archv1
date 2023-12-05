import {
  View,
  Text,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import {styles} from './styles';

const ActionAlertModal = ({
  hideActionModal,
  actionAlertModalVisible,
  onSelect,
  optionsList,
}: any) => {
  return (
    <Modal
      transparent={true}
      visible={actionAlertModalVisible}
      onRequestClose={hideActionModal}>
      <Pressable style={styles.centeredView} onPress={hideActionModal}>
        <View>
          <Pressable onPress={() => {}} style={[styles.modalView]}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {optionsList?.map((val: any, index: any) => {
                return (
                  <TouchableOpacity
                    onPress={async () => {
                      onSelect(index);
                    }}
                    key={index}
                    style={styles.filtersView}>
                    <Text style={styles.filterText}>{val}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ActionAlertModal;
