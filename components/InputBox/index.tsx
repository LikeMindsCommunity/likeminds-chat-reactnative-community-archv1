import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import React, {useState} from 'react';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {onConversationsCreate} from '../../store/actions/chatroom';
import {UPDATE_CONVERSATIONS} from '../../store/types/types';
import {ReplyBox} from '../ReplyConversations';
// import database from '@react-native-firebase/database';

// let addItem = (payload: any) => {
//   database().ref('/users').push(payload);
// };

interface InputBox {
  isReply: boolean;
  replyChatID: any;
  chatroomID: any;
  replyMessage: any;
  setIsReply: any;
  setReplyMessage: any;
}

const InputBox = ({
  isReply,
  replyChatID,
  chatroomID,
  replyMessage,
  setIsReply,
  setReplyMessage,
}: InputBox) => {
  const [isKeyBoardFocused, setIsKeyBoardFocused] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const dispatch = useAppDispatch();
  const myChatrooms = useAppSelector(state => state.homefeed.myChatrooms);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const onSend = async () => {
    let time = new Date(Date.now());
    let hr = time.getHours();
    let min = time.getMinutes();
    if (!!message.trim()) {
      // dispatch({
      //   type: UPDATE_CONVERSATIONS,
      //   body: {
      //     member: {id: 86975, name: 'Jai'},
      //     answer: message,
      //     created_at: `${hr.toLocaleString('en-US', {
      //       minimumIntegerDigits: 2,
      //       useGrouping: false,
      //     })}:${min.toLocaleString('en-US', {
      //       minimumIntegerDigits: 2,
      //       useGrouping: false,
      //     })}`,
      //     id: 11111,
      //   },
      // });
      setMessage('');

      let payload = {
        chatroom_id: chatroomID,
        created_at: new Date(Date.now()),
        has_files: false,
        text: message.trim(),
        // attachment_count?: any;
        replied_conversation_id: replyMessage?.id,
      };
      let response = await dispatch(onConversationsCreate(payload) as any);
      setIsReply(false);
      setReplyMessage();
      // addItem(payload);
      // if (!!response) {
      //   setMessage('');
      // }
    }
  };

  return (
    <View>
      <View
        style={[
          styles.inputContainer,
          {
            marginBottom: isKeyBoardFocused
              ? Platform.OS === 'android'
                ? 35
                : 5
              : Platform.OS === 'ios'
              ? 20
              : 5,
          },
        ]}>
        <View style={isReply ? styles.replyBoxParent : null}>
          {isReply && (
            <View style={styles.replyBox}>
              <ReplyBox isIncluded={false} item={replyMessage} />
              <TouchableOpacity
                onPress={() => {
                  setIsReply(false);
                  setReplyMessage();
                }}
                style={styles.replyBoxClose}>
                <Image
                  style={styles.replyCloseImg}
                  source={require('../../assets/images/close_icon.png')}
                />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[
              styles.textInput,
              isReply
                ? {
                    borderWidth: 0,
                  }
                : null,
            ]}>
            {/* <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setShowEmoji(!showEmoji)}>
            <Image
              source={require('../../assets/images/smile_emoji3x.png')}
              style={styles.emoji}
            />
          </TouchableOpacity> */}

            <View
              style={[
                styles.inputParent,
                Platform.OS === 'ios'
                  ? {
                      minHeight: 30,
                      maxHeight: 120,
                    }
                  : {height: 30},
              ]}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                style={styles.input}
                numberOfLines={6}
                multiline={true}
                onBlur={() => {
                  setIsKeyBoardFocused(false);
                }}
                onFocus={() => {
                  setIsKeyBoardFocused(true);
                }}
                placeholder="Type a message..."
                placeholderTextColor="#aaa"
              />
            </View>
            {/* <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setModalVisible(true)}>
            <Image
              source={require('../../assets/images/open_files3x.png')}
              style={styles.emoji}
            />
          </TouchableOpacity> */}
          </View>
        </View>

        <TouchableOpacity onPressOut={onSend} style={styles.sendButton}>
          <Image
            source={require('../../assets/images/send_button3x.png')}
            style={styles.emoji}
          />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <Pressable style={styles.centeredView} onPress={handleModalClose}>
          <View style={styles.modalViewParent}>
            <Pressable onPress={() => {}} style={[styles.modalView]}>
              <View style={styles.alignModalElements}>
                <TouchableOpacity style={styles.cameraStyle}>
                  <Image
                    source={require('../../assets/images/camera_icon3x.png')}
                    style={styles.emoji}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageStyle}>
                  <Image
                    source={require('../../assets/images/select_image_icon3x.png')}
                    style={styles.emoji}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.docStyle}>
                  <Image
                    source={require('../../assets/images/select_doc_icon3x.png')}
                    style={styles.emoji}
                  />
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      {/* {showEmoji && (
        <View style={styles.emojiPicker}>
          <Emoji name="smile" style={styles.emoji} />
          <Emoji name="satisfied" style={styles.emoji} />
          <Emoji name="joy" style={styles.emoji} />
          <Emoji name="blush" style={styles.emoji} />
          <Emoji name="heart_eyes" style={styles.emoji} />
        </View>
      )} */}
    </View>
  );
};

export default InputBox;
