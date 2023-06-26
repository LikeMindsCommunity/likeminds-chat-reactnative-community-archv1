import {StyleSheet} from 'react-native';
import Layout from '../../constants/Layout';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  itemContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'black',
    opacity: 0.5,
  },
  centeredView: {
    flex: 1,
    backgroundColor: '#000000aa',
  },
  modalParent: {
    position: 'absolute',
    bottom: 0,
    borderTopEndRadius: 15,
    borderTopLeftRadius: 15,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: Layout.window.width,
    height: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    padding: 5,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderTopEndRadius: 15,
    borderTopLeftRadius: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  bar: {
    height: 8,
    width: 100,
    alignSelf: 'center',
    backgroundColor: STYLES.$COLORS.JOINED_BTN,
    borderRadius: 10,
  },
  text: {
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.SEMI_BOLD,
    color: STYLES.$COLORS.PRIMARY,
    marginBottom: 10,
  },
});
