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
  nothingFab: {
    backgroundColor: STYLES.$COLORS.SECONDARY,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 10,
    borderRadius: 50,
  },
  fabImg: {height: 20, width: 20, resizeMode: 'contain'},
  nothingImg: {height: 100, width: 100, resizeMode: 'contain'},
  nothingDM: {display: 'flex', flexGrow: 1},
  text: {
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
    color: STYLES.$COLORS.TERTIARY,
  },
  justifyCenter: {
    padding: STYLES.$PADDINGS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: STYLES.$COLORS.TERTIARY,
    flex: 1,
    gap: 10,
  },
  title: {
    fontSize: STYLES.$FONT_SIZES.LARGE,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.PRIMARY,
  },
  subTitle: {
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.MSG,
    textAlign: 'center',
  },
});

export default styles;
