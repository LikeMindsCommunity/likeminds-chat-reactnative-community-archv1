import {Platform, StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';
import Layout from '../../constants/Layout';

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flex: 1,
    top: Platform.OS === 'ios' ? 50 : 0,
    justifyContent: 'center',
    backgroundColor: 'black',
    zIndex: 1,
    opacity: 0.8,
  },
  image: {
    width: Layout.window.width,
    height:
      Platform.OS === 'ios' ? Layout.window.height - 100 : Layout.window.height,
    resizeMode: 'contain',
  },
  video: {
    display: 'flex',
    justifyContent: 'center',
    width: Layout.window.width,
    height:
      Platform.OS === 'ios' ? Layout.window.height - 100 : Layout.window.height,
  },
  videoPlayer: {
    width: Layout.window.width,
    height:
      Platform.OS === 'ios' ? Layout.window.height - 100 : Layout.window.height,
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  backBtn: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: STYLES.$COLORS.TERTIARY,
    padding: 5,
  },
  chatRoomInfo: {gap: 5},
});

export default styles;
