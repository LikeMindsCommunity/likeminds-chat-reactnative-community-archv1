import Layout from '../../constants/Layout';
import {Platform, StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: Platform.OS === 'ios' ? -5 : 0,
  },
  selectedHeadingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  backBtn: {height: 40, width: 40, borderRadius: 10, resizeMode: 'contain'},
  lightGreyBackground: {
    color: '#c5c5c5',
  },
  lightGreyThumb: {
    color: '#f4f3f4',
  },
  greyColor: {
    color: 'grey',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  primaryColor: {
    // color: STYLES.$COLORS.PRIMARY,
    color: 'hsl(222, 53%, 15%)',
  },
  lightPrimaryColor: {
    color: 'hsl(222, 40%, 40%)',
  },
  whiteColor: {
    color: STYLES.$COLORS.TERTIARY,
  },
  blackColor: {
    color: '#000000',
  },
  padding20: {
    padding: 20,
  },
  paddingHorizontal15: {
    paddingHorizontal: 15,
  },
  paddingVertical5: {
    paddingVertical: 5,
  },
  paddingVertical10: {
    paddingVertical: 10,
  },
  marginSpace: {
    marginTop: 10,
  },
  mediumMarginSpace: {
    marginTop: 15,
  },
  extraMarginSpace: {
    marginTop: 20,
  },
  gap: {
    gap: 5,
  },
  gap10: {
    gap: 10,
  },
  centeredView: {
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalViewParent: {
    position: 'absolute',
    top: 50,
    flexGrow: 1,
    width: Layout.window.width,
    height: Layout.window.height,
  },
  addOptionsModalViewParent: {
    position: 'absolute',
    bottom: 0,
    flexGrow: 1,
    width: Layout.window.width,
    height: Layout.window.height / 3,
  },
  modalView: {
    // margin: 10,
    backgroundColor: '#e8ebf0',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    paddingVertical: 5,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: '100%',
  },
  alignModalElements: {
    display: 'flex',
    // marginVertical: 20,
    flexGrow: 1,
  },
  font: {
    fontSize: 16,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.PRIMARY,
  },
  text: {
    fontSize: 16,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.PRIMARY,
  },
  mediumText: {
    fontSize: 13,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.PRIMARY,
  },
  boldText: {
    fontSize: 16,
    fontFamily: STYLES.$FONT_TYPES.BOLD,
    color: STYLES.$COLORS.PRIMARY,
  },
  mediumBoldText: {
    fontSize: 16,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.PRIMARY,
  },
  smallText: {
    fontSize: 12,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    color: STYLES.$COLORS.PRIMARY,
  },
  smallTextMedium: {
    fontSize: 12,
    fontFamily: STYLES.$FONT_TYPES.MEDIUM,
    color: STYLES.$COLORS.PRIMARY,
  },
  newPollText: {
    color: 'black',
  },
  alignRow: {
    display: 'flex',
    flexDirection: 'row',

    // flexGrow: 1,
    alignItems: 'center',
  },
  justifySpace: {
    justifyContent: 'space-between',
  },
  textAlignCenter: {
    textAlign: 'center',
  },
  viewStyle: {
    width: Layout.window.width / 3,
  },
  header: {
    marginLeft: -10,
    paddingVertical: 15,
  },
  pollQuestion: {
    padding: 15,
    backgroundColor: STYLES.$COLORS.TERTIARY,
  },
  question: {
    marginTop: 10,
  },
  answerOptions: {
    paddingVertical: 15,
    paddingHorizontal: 0,
    backgroundColor: STYLES.$COLORS.TERTIARY,
    marginTop: 15,
  },
  advancedOptions: {
    paddingHorizontal: 0,
    backgroundColor: STYLES.$COLORS.TERTIARY,
    marginTop: 15,
    paddingBottom: 10,
  },
  option: {
    paddingVertical: 10,
  },
  addOptionText: {
    marginTop: 4,
  },
  optionIcon: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    marginRight: 5,
    marginLeft: -5,
    tintColor: STYLES.$COLORS.PRIMARY,
  },
  pollIconParent: {
    height: 30,
    width: 30,
    borderRadius: 50,
    backgroundColor: STYLES.$COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pollEndedTime: {
    borderRadius: 50,
    backgroundColor: STYLES.$COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pollIcon: {
    height: 15,
    width: 15,
    resizeMode: 'contain',
  },
  placeHolder: {
    color: '#D3D3D3',
  },
  postButton: {
    padding: 10,
    paddingHorizontal: 50,
    borderRadius: 50,
    backgroundColor: STYLES.$COLORS.PRIMARY,
    alignSelf: 'center',
  },
  pollButton: {
    borderRadius: 8,
    borderColor: STYLES.$COLORS.SECONDARY,
    borderWidth: 1,
  },
  greyPollButton: {
    borderRadius: 8,
    borderColor: '#c5c5c5',
    borderWidth: 1,
  },
  pollButtonBackground: {
    margin: 2,
    padding: 13,
    borderRadius: 5,
  },
  pollButtonPadding: {paddingVertical: 20, paddingHorizontal: 0},
  submitButton: {
    borderRadius: 50,
    width: 150,
    backgroundColor: STYLES.$COLORS.PRIMARY,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center',
    padding: 12,
  },
  submitVoteButton: {
    borderRadius: 50,
    width: 140,
    backgroundColor: STYLES.$COLORS.TERTIARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderColor: STYLES.$COLORS.PRIMARY,
    borderWidth: 1,
    gap: 5,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    borderColor: '#c5c5c5',
    borderWidth: 1,
    fontFamily: STYLES.$FONT_TYPES.LIGHT,
    fontSize: 14,
    color: STYLES.$COLORS.PRIMARY,
  },
  borderBottom: {
    borderBottomColor: '#c5c5c5',
    borderBottomWidth: 1,
  },
  greyBorder: {borderColor: '#c5c5c5'},
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
  messageDate: {
    fontSize: 10,
    color: '#aaa',
    // marginTop: 5,
    textAlign: 'right',
  },
  alignTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
  },
  downArrow: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: '#c5c5c5',
    marginTop: Platform.OS === 'ios' ? -3 : 0,
  },
  selectedItem: {
    height: '100%',
    width: '100%',
    backgroundColor: STYLES.$COLORS.SELECTED_BLUE,
    position: 'absolute',
    opacity: 0,
    zIndex: 1,
  },
  selected: {
    backgroundColor: STYLES.$COLORS.PRIMARY,
    height: 25,
    width: 25,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    position: 'absolute',
    right: 10,
    top: '25%',
    zIndex: 1,
  },
  smallIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain',
  },
  editIcon: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
    tintColor: STYLES.$COLORS.PRIMARY,
  },
  optionText: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    left: 5,
    top: Platform.OS === 'ios' ? '35%' : '30%',
  },
});
