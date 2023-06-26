import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';
import Layout from '../../constants/Layout';

export const styles = StyleSheet.create({
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {height: 35, width: 35, borderRadius: 10, resizeMode: 'contain'},
  chatRoomInfo: {gap: 5},
  videoIcon: {height: 20, width: 20, resizeMode: 'contain', tintColor: 'white'},
  video: {
    display: 'flex',
    justifyContent: 'center',
    width: Layout.window.width,
    height: Layout.window.height,
  },
  videoPlayer: {},
});
