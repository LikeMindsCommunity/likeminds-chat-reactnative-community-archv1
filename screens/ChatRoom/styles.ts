import {StyleSheet} from 'react-native';
import STYLES from '../../constants/Styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  backBtn: {height: 40, width: 40, borderRadius: 10, resizeMode: 'contain'},
  threeDots: {height: 20, width: 20, resizeMode: 'contain'},
  chatRoomInfo: {gap: 5},

  inputContainer: {
    flexDirection: 'row',
    // padding: 10,
    // backgroundColor: '#fff',
    elevation: 2,
    flexGrow: 1,
    backgroundColor: 'pink',
  },
  emojiButton: {
    padding: 10,
  },
  emoji: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
    elevation: 2,
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
