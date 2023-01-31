import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: STYLES.$PADDINGS.LARGE,
    alignItems: 'center',
    backgroundColor: STYLES.$COLORS.TERTIARY,
  },
  avatar: {
    width: STYLES.$AVATAR.WIDTH,
    height: STYLES.$AVATAR.HEIGHT,
    borderRadius: STYLES.$AVATAR.BORDER_RADIUS,
    marginRight: STYLES.$MARGINS.SMALL,
  },
  infoParent: {flex: 1},
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    fontSize: STYLES.$FONT_SIZES.LARGE,
    width: 160,
  },
  lastMessage: {
    color: STYLES.$COLORS.MSG,
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
  },
  joinBtnContainer: {
    backgroundColor: STYLES.$COLORS.SECONDARY,
    borderRadius: 10,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
  },
  join: {
    color: 'white',
    fontSize: STYLES.$FONT_SIZES.LARGE,
    fontWeight: 'bold',
    // paddingHorizontal: 5,
  },
  icon: {
    width: 40,
    height: 25,
    resizeMode: 'contain',
    borderRadius: STYLES.$AVATAR.BORDER_RADIUS,
    // marginRight: STYLES.$MARGINS.LARGE,
    // marginLeft: STYLES.$MARGINS.SMALL,
  },
  chatroomInfo: {
    fontSize:STYLES.$FONT_SIZES.LARGE,
    marginTop: STYLES.$MARGINS.SMALL,
    // marginRight:STYLES.$MARGINS.SMALL,
    width: 290,
  },
});
