import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

const styles = StyleSheet.create({
  page: {
    backgroundColor: STYLES.$BACKGROUND_COLORS.LIGHT,
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
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
    // justifyContent: 'center',
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
  secondaryTitle: {
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.MSG,
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
  nothingImg: {height: 100, width: 100, resizeMode: 'contain'},
  nothingDM: {display: 'flex', flexGrow: 1},
  justifyCenter: {
    padding: STYLES.$PADDINGS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: STYLES.$COLORS.TERTIARY,
    flex: 1,
    gap: 10,
  },
  subTitle: {
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.MSG,
    textAlign: 'center',
  },
  gap: {gap: 5},
});

export default styles;
