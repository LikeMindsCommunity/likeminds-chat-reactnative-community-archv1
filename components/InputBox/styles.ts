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
    alignItems: "flex-end",
    flexGrow: 1,
    borderRadius: 30,
    overflow: 'hidden',
    maxWidth: Layout.window.width - 75,
    minWidth: Layout.window.width - 75,
    borderColor: STYLES.$COLORS.MSG,
    borderWidth: 1,
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems:'flex-end',
    padding: 5,
    margin:5,
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
  input: {
    flexGrow: 1,
    marginVertical: 10,
    paddingLeft: 0,
    fontSize: STYLES.$FONT_SIZES.LARGE,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.SECONDARY,
    width: Layout.window.width - 180,
    maxHeight: 120,
    minHeight: 30,
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
});
