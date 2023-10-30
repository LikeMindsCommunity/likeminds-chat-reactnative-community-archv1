import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';
import Layout from '../../constants/Layout';

export const styles = StyleSheet.create({
  linkPreview: {
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
  },
  messageDate: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'right',
  },
  linkPreviewBox: {
    maxHeight: 350,
    backgroundColor: STYLES.$COLORS.JOINED_BTN,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: STYLES.$MARGINS.XS,
  },
  linkPreviewIcon: {
    height: 250,
    resizeMode: 'cover',
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
  linkPreviewTitle: {
    color: 'black',
    fontSize: STYLES.$FONT_SIZES.MEDIUM,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
    overflow: 'hidden',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
  linkPreviewMessageText: {
    fontSize: STYLES.$FONT_SIZES.SMALL,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.PRIMARY,
    maxWidth: Layout.window.width - 150,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
});
