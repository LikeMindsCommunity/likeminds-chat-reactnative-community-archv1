import {Platform, StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    padding: STYLES.$PADDINGS.MEDIUM,
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: STYLES.$COLORS.TERTIARY,
  },
  alignHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  icon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
    marginRight: 5,
    marginLeft: STYLES.$MARGINS.SMALL,
  },
  pinIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: STYLES.$MARGINS.LARGE,
  },
  cancelPinIconParent:{
    width: 30,
    height: 30,
    marginRight: STYLES.$MARGINS.SMALL,
  },
  cancelPinIcon :{
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: STYLES.$FONT_SIZES.LARGE,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.PRIMARY,
  },

  centeredView: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 20,
  },
  modalView: {
    marginLeft: 10,
    marginTop: Platform.OS === 'ios' ? 115 : 80,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    padding: 5,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  filtersView: {paddingHorizontal: 10, paddingVertical: 20},
  filterText: {
    fontSize: STYLES.$FONT_SIZES.LARGE,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.PRIMARY,
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
  cancelPinnedBtn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: STYLES.$COLORS.SECONDARY,
    borderWidth: 1,
    padding: 5,
    borderRadius: 20,
    marginRight: 20,
  },
});
