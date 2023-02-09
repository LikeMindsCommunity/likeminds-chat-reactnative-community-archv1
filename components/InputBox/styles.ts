import {Platform, StyleSheet} from 'react-native';
import Layout from '../../constants/Layout';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  //   message: {
  //     padding: 10,
  //     margin: 10,
  //     maxWidth: '80%',
  //     alignSelf: 'flex-end',
  //     borderRadius: 5,
  //     backgroundColor: '#fff',
  //     elevation: 2,
  //   },
  //   sentMessage: {
  //     alignSelf: 'flex-end',
  //     backgroundColor: '#ddd',
  //   },
  //   receivedMessage: {
  //     alignSelf: 'flex-start',
  //     backgroundColor: '#e6e6e6',
  //   },
  //   messageText: {
  //     fontSize: 16,
  //   },
  //   messageDate: {
  //     fontSize: 10,
  //     color: '#aaa',
  //     marginTop: 5,
  //     textAlign: 'right',
  //   },
  textInput: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexGrow: 1,
    borderRadius: 30,
    overflow: 'hidden',
    maxWidth: Layout.window.width - 75,
    minWidth: Layout.window.width - 75,
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
    // marginVertical: 10,
    // backgroundColor:'blue'
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
    minHeight: 30,
    flexGrow: 1,
    marginVertical: 10,
    paddingLeft: 0,
    width: Layout.window.width - 180,
  },
  input: {
    flexGrow: 1,
    fontSize: STYLES.$FONT_SIZES.XL,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.SECONDARY,

    maxHeight: 120,
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
    elevation: 2,
  },

  centeredView: {
    flex: 1,
    marginTop: 20,
  },
  modalViewParent: {
    position: 'absolute',
    bottom: 80,
    flex: 1,
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
});
