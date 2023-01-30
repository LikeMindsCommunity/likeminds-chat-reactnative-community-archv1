import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: STYLES.$PADDINGS.MEDIUM,
    alignItems: 'center',
    backgroundColor: STYLES.$COLORS.TERTIARY,
  },
  avatar: {
    width: STYLES.$AVATAR.WIDTH,
    height: STYLES.$AVATAR.HEIGHT,
    borderRadius: STYLES.$AVATAR.BORDER_RADIUS,
    marginRight: STYLES.$MARGINS.SMALL,
  },
  infoContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    fontSize: STYLES.$FONT_SIZES.LARGE,
    width: 200
  },
  time: {
    color: STYLES.$COLORS.MSG,
    fontSize: STYLES.$FONT_SIZES.SMALL,
  },
  lastMessage: {
    color: STYLES.$COLORS.MSG,
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    width: 240
  },
  pinned: {
    width: 20,
    height: 20,
    backgroundColor: STYLES.$COLORS.PRIMARY,
    borderRadius: 10,
    position: 'absolute',
    top: 16,
    right: 16,
  },
  unreadCountContainer: {
    width: 20,
    height: 20,
    backgroundColor: STYLES.$COLORS.PRIMARY,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    right: 20,
  },
  unreadCount: {
    color: 'white',
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontWeight: 'bold',
  },
});
