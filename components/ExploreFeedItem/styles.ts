import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: STYLES.$PADDINGS.MEDIUM,
    alignItems: 'center',
    backgroundColor: STYLES.$COLORS.TERTIARY,
  },
})