import {StatusBar, StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  avatar: {
    width: STYLES.$AVATAR.WIDTH - 10,
    height: STYLES.$AVATAR.HEIGHT - 10,
    borderRadius: STYLES.$AVATAR.BORDER_RADIUS,
    marginRight: STYLES.$MARGINS.SMALL,
  },
  container: {
    // marginTop: StatusBar.currentHeight,
  },
  scene: {
    flex: 1,
  },
  textHeading: {
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.SEMI_BOLD,
    color: STYLES.$COLORS.PRIMARY,
  },
  text: {
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.MSG,
  },
  reactionItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: STYLES.$PADDINGS.MEDIUM,
  },
  alignRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  alignColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 5,
    flexGrow: 1,
  },
  messageText: {
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.SECONDARY,
  },
});
