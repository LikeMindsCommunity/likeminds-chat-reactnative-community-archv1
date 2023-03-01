import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

const styles = StyleSheet.create({
  page: {
    backgroundColor: STYLES.$BACKGROUND_COLORS.LIGHT,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {height: 35, width: 40, borderRadius: 10, resizeMode: 'contain'},
  chatRoomInfo: {gap: 5},
  threeDots: {
    height: 10,
    width: 10,
    resizeMode: 'contain',
  },
  textHeading: {
    color: STYLES.$COLORS.PRIMARY,
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
  },
  text: {
    color: STYLES.$COLORS.PRIMARY,
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
  },
  btnText: {
    color: STYLES.$COLORS.MSG,
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
  },
  reasonsBtn: {
    borderRadius: 16,
    padding: 8,
    margin: 8,
    borderWidth: 1,
    borderColor: STYLES.$COLORS.MSG,
  },
  reportBtnParent: {
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 40,
  },
  reportBtn: {
    backgroundColor: STYLES.$COLORS.RED,
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  reportBtnText: {
    color: 'white',
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
  },
});

export default styles;
