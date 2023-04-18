import {Platform, StyleSheet} from 'react-native';
import STYLES from '../../../../constants/Styles';

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
  fab: {
    position: 'absolute',
    backgroundColor: STYLES.$COLORS.SECONDARY,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 10,
    borderRadius: 50,
    bottom: Platform.OS == 'ios' ? 30 : 20,
    right: 20,
  },
  fabImg: {height: 20, width: 20, resizeMode: 'contain'},
  text: {
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
    color: STYLES.$COLORS.TERTIARY,
  },
});

export default styles;
