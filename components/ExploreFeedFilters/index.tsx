import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
} from 'react-native';
import STYLES from '../../constants/Styles';
import {styles} from './styles';

interface Props {
  isPinned: boolean;
}

const ExploreFeedFilters = ({isPinned}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const handleModalClose = () => {
    setModalVisible(false);
  };
  const arr = [
    'Newest',
    'Recently active',
    'Most participants',
    'Most messages',
  ];

  return (
    <View>
      <View style={styles.alignHeader}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
          style={styles.itemContainer}>
          <Text style={styles.titleText}>Newest</Text>
          <Image
            source={require('../../assets/images/down_arrow3x.png')}
            style={styles.icon}
          />
        </TouchableOpacity>

        {!isPinned ? (
          <TouchableOpacity style={styles.cancelPinnedBtn}>
            <View style={styles.cancelPinIconParent}>
              <Image
                source={require('../../assets/images/pin_icon_blue3x.png')}
                style={styles.cancelPinIcon}
              />
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={styles.titleText}>Pinned</Text>
              <Image
                source={require('../../assets/images/cross_icon3x.png')}
                style={styles.icon}
              />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Image
              source={require('../../assets/images/pin_icon_grey3x.png')}
              style={styles.pinIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      <Modal
        // animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <Pressable style={styles.centeredView} onPress={handleModalClose}>
          <View>
            <Pressable onPress={() => {}} style={[styles.modalView]}>
              {arr.map((val, index) => (
                <View key={val + index} style={styles.filtersView}>
                  <Text style={styles.filterText}>{val}</Text>
                </View>
              ))}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ExploreFeedFilters;
