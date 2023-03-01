import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {height: 35, width: 35, borderRadius: 10, resizeMode: 'contain'},
  chatRoomInfo: {gap: 5},
});
