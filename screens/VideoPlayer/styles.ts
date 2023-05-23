import {StyleSheet} from 'react-native';
import Layout from '../../constants/Layout';

export const styles = StyleSheet.create({
  video: {
    display: 'flex',
    justifyContent: 'center',
    width: Layout.window.width,
    height: Layout.window.height,
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {height: 35, width: 35, borderRadius: 10, resizeMode: 'contain'},
  chatRoomInfo: {gap: 5},
  videoPlayer: {},
});
