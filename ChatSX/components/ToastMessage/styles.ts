import {StyleSheet} from 'react-native';
import Layout from '../../constants/Layout';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    marginTop: 20,
  },
  modalParent: {
    position: 'absolute',
    bottom: 60,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,

    width: Layout.window.width,
  },
  modalView: {
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    backgroundColor: STYLES.$COLORS.PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    // backgroundColor:'blue',
  },
  filtersView: {paddingHorizontal: 10, paddingVertical: 20},
  filterText: {
    fontSize: STYLES.$FONT_SIZES.LARGE,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.TERTIARY,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    // elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
