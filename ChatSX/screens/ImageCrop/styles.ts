import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  rotateIcon: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    tintColor: STYLES.$COLORS.TERTIARY,
  },
  item: {
    padding: 5,
  },
  cropView: {
    width: '100%',
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.TERTIARY,
  },
  bottom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'black',
  },
});
