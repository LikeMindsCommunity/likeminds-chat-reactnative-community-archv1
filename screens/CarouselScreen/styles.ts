import {Platform, StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';
import Layout from '../../constants/Layout';

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flex: 1,
    top: 50,
    justifyContent: 'center',
    backgroundColor: 'black',
    zIndex: 1,
    opacity: 0.8,
  },
  video: {
    display: 'flex',
    justifyContent: 'center',
    width: Layout.window.width,
    height: Layout.window.height - 100,
  },
  videoPlayer: {
    width: Layout.window.width,
    height: Layout.window.height - 100,
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
    width: 35,
    borderRadius: 10,
    resizeMode: 'contain',
    tintColor: STYLES.$COLORS.TERTIARY,
  },
  chatRoomInfo: {gap: 5},
});

export default styles;
