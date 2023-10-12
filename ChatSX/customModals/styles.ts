import {Platform, StyleSheet} from 'react-native';
import STYLES from '../constants/Styles';

export const styles = StyleSheet.create({
  // alert Modal design
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 25,
    paddingBottom: 20,
    width: '80%',
  },
  title: {
    fontSize: STYLES.$FONT_SIZES.XXL,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.PRIMARY,
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.PRIMARY,
    marginBottom: 20,
    lineHeight: 20,
    fontWeight: '400',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rejectButtonContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 15,
  },
  button: {
    padding: 10,
    alignItems: 'flex-end',
    width: 90,
  },
  rejectButton: {
    padding: 10,
    alignItems: 'flex-end',
    // width: 90,
  },
  buttonText: {
    fontSize: STYLES.$FONT_SIZES.REGULAR,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.SECONDARY,
    textTransform: 'uppercase',
  },
  cancelButton: {
    borderBottomLeftRadius: 10,
  },
  cancelButtonText: {
    color: STYLES.$COLORS.MSG,
  },
  okButton: {
    // backgroundColor: '#2ecc71',
    borderBottomRightRadius: 10,
  },
});
