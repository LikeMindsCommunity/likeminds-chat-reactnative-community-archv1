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

  message: {
    padding: 10,
    margin: 10,
    maxWidth: '80%',
    alignSelf: 'flex-end',
    borderRadius: 5,
    backgroundColor: '#fff',
    elevation: 2,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ddd',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6e6e6',
  },
  messageText: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    // padding: 10,
    // backgroundColor: '#fff',
    elevation: 2,
    flexGrow:1,
    backgroundColor:'pink'
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
