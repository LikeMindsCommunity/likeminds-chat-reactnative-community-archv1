import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

const styles = StyleSheet.create({
  page: {
    backgroundColor: STYLES.$BACKGROUND_COLORS.LIGHT,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: STYLES.$AVATAR.BORDER_RADIUS,
    marginRight: STYLES.$MARGINS.SMALL,
  },
  font: {
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    textTransform: 'none',
  },
  participants: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1,
  },
  infoContainer: {
    flex: 1,
  },
  messageCustomTitle: {
    color: STYLES.$COLORS.SECONDARY,
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
  },
  title: {
    fontSize: STYLES.$FONT_SIZES.LARGE,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.PRIMARY,
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {height: 40, width: 40, resizeMode: 'contain'},
  search: {height: 20, width: 20, resizeMode: 'contain'},
  chatRoomInfo: {gap: 5},
});

export default styles;
