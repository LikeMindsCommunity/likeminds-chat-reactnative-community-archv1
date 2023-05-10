import {Platform, StyleSheet} from 'react-native';
import Layout from '../../constants/Layout';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  textInput: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexGrow: 1,
    borderRadius: 30,
    overflow: 'hidden',
    // maxWidth: Layout.window.width - 75,
    width: Layout.window.width - 75,
    borderColor: STYLES.$COLORS.MSG,
    borderWidth: 1,
    // backgroundColor:'pink'
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 5,
    margin: 5,
  },
  emojiButton: {
    padding: 15,
  },
  emoji: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  inputParent: {
    // backgroundColor: 'yellow',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // flexGrow: 1,
    marginVertical: 10,
    paddingLeft: 0,
    // height: 30,
    // minHeight: 30,
    // maxHeight: 120,
    // width: Layout.window.width - 180,
    // width:'65%', // when both emoji and updload icon is there
    width: '90%',
    marginHorizontal: 20,
  },
  input: {
    flexGrow: 1,
    fontSize: STYLES.$FONT_SIZES.XL,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.SECONDARY,
    maxHeight: 120,
    padding: 0,
    marginBottom: 2,
    overflow: 'scroll',
  },
  sendButton: {
    height: 50,
    width: 50,
    // padding: 15,
    backgroundColor: STYLES.$COLORS.SECONDARY,
    borderRadius: 50,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    marginLeft: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emojiPicker: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    padding: 10,
    // elevation: 2,
  },

  centeredView: {
    flexGrow: 1,
    marginTop: 20,
  },
  modalViewParent: {
    position: 'absolute',
    bottom: 80,
    flexGrow: 1,
    width: Layout.window.width,
  },
  modalView: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 8,
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

  alignModalElements: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  cameraStyle: {backgroundColor: '#06C3AF', padding: 15, borderRadius: 50},
  imageStyle: {backgroundColor: '#9F5BCA', padding: 15, borderRadius: 50},
  docStyle: {backgroundColor: '#9F5BCA', padding: 15, borderRadius: 50},
  replyBoxParent: {
    backgroundColor: 'white',
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  replyBox: {marginHorizontal: 10, marginTop: 10},
  replyBoxClose: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: STYLES.$COLORS.SELECTED_BLUE,
    padding: 5,
    borderRadius: 10,
  },
  replyCloseImg: {height: 5, width: 5, resizeMode: 'contain'},

    // alert Modal design
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: '#fff',
      padding: 30,
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
      fontSize: STYLES.$FONT_SIZES.LARGE,
      fontFamily: STYLES.$FONT_TYPES.LIGHT,
      color: STYLES.$COLORS.PRIMARY,
      marginBottom: 20,
      lineHeight: 25,
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
      fontSize: STYLES.$FONT_SIZES.MEDIUM,
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
