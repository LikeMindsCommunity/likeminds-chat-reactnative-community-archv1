import {Platform, StyleSheet} from 'react-native';
import Layout from '../../constants/Layout';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  messageParent: {
    margin: 20,
    marginBottom: 0,
  },
  replyMessage: {
    padding: 10,
    width: '80%',
    alignSelf: 'flex-end',
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: STYLES.$COLORS.TERTIARY,
    borderBottomRightRadius: 0,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: STYLES.$COLORS.TERTIARY,
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.PRIMARY,
    maxWidth: Layout.window.width - 150,
    // textAlign: 'left',
  },
  messageDate: {
    fontSize: 10,
    color: '#aaa',
    // marginTop: 5,
    textAlign: 'right',
  },
  replySender: {
    color: 'green',
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
  },
  replyBox: {
    maxHeight: 60,
    backgroundColor: STYLES.$COLORS.JOINED_BTN,
    borderRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: STYLES.$COLORS.SECONDARY,
    padding: 10,
    overflow: 'hidden',
    marginBottom: STYLES.$MARGINS.XS,
  },
  icon: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
    marginRight: 5,
  },
  alignRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  displayRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  alignTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
  },
  messageInfo: {
    color: 'green',
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
    marginBottom: STYLES.$MARGINS.XS,
  },
  messageCustomTitle: {
    color: STYLES.$COLORS.MSG,
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
  },
  gifView: {
    backgroundColor: STYLES.$COLORS.MSG,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  gifText: {
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    fontSize: STYLES.$FONT_SIZES.XS,
    color: 'white',
    marginTop: Platform.OS === 'ios' ? 1 : 0,
  },
});
