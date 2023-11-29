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
import {useAppDispatch} from '../../store';
import {getExploreFeedData} from '../../store/actions/explorefeed';
import {styles} from './styles';
import {Events, Keys} from '../../enums';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';

interface Props {
  isPinned: boolean;
  setIsPinned: (val: any) => void;
  setFilterState: (val: any) => void;
  filterState: any;
  pinnedChatroomsCount: number;
}

const ExploreFeedFilters = ({
  isPinned,
  filterState,
  setFilterState,
  setIsPinned,
  pinnedChatroomsCount,
}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleModalClose = () => {
    setModalVisible(false);
  };
  const arr = [
    'Newest',
    'Recently active',
    'Most messages',
    'Most participants',
  ];

  return (
    <View>
      <View style={styles.alignHeader}>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(!modalVisible);
          }}
          style={styles.itemContainer}>
          <Text style={styles.titleText}>{arr[filterState]}</Text>
          <Image
            source={require('../../assets/images/down_arrow3x.png')}
            style={styles.icon}
          />
        </TouchableOpacity>

        {isPinned ? (
          <TouchableOpacity
            onPress={() => {
              setIsPinned(false);
            }}
            style={styles.cancelPinnedBtn}>
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
        ) : pinnedChatroomsCount > 3 ? (
          <TouchableOpacity
            onPress={() => {
              setIsPinned(true);
              LMChatAnalytics.track(
                Events.PINNED_CHATROOM_VIEWED,
                new Map<string, string>([[Keys.SOURCE, 'overflow_menu']]),
              );
            }}>
            <Image
              source={require('../../assets/images/pin_icon_grey3x.png')}
              style={styles.pinIcon}
            />
          </TouchableOpacity>
        ) : null}
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
                <TouchableOpacity
                  onPress={() => {
                    setFilterState(index);
                  }}
                  key={val + index}
                  style={styles.filtersView}>
                  <Text style={styles.filterText}>{val}</Text>
                </TouchableOpacity>
              ))}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ExploreFeedFilters;
