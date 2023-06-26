import {Platform, StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';
import Layout from '../../constants/Layout';

const styles = StyleSheet.create({
  header: {
    display: 'flex',
    flex: 1,
    top: Platform.OS === 'ios' ? 70 : 30,
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    opacity: 0.8,
  },
  headerElement: {
    backgroundColor: 'black',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 10,
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
    flex: 1,
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
