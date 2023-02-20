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

interface InputBox {
  isReply: boolean;
  replyChatID: any;
}

const InputBox = ({isReply, replyChatID}: InputBox) => {
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
    if (!!message) {
      let payload = {
        chatroom_id: 69285,
        created_at: new Date(Date.now()),
        has_files: false,
        text: message,
        // attachment_count?: any;
        // replied_conversation_id?: string | number;
      };
      let response = await dispatch(onConversationsCreate(payload) as any);
      if (!!response) {
        setMessage('');
      }
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
        <View style={styles.textInput}>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setShowEmoji(!showEmoji)}>
            <Image
              source={require('../../assets/images/smile_emoji3x.png')}
              style={styles.emoji}
            />
          </TouchableOpacity>
          <View style={[styles.inputParent]}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              style={styles.input}
              numberOfLines={6}
              multiline={true}
              // onPressIn={() => {
              //   setIsKeyBoardFocused(true);
              // }}
              onBlur={() => {
                setIsKeyBoardFocused(false);
              }}
              onFocus={() => {
                setIsKeyBoardFocused(true);
              }}
              // onPressOut={() => {
              //   setIsKeyBoardFocused(false);
              // }}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
            />
          </View>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setModalVisible(true)}>
            <Image
              source={require('../../assets/images/open_files3x.png')}
              style={styles.emoji}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onSend} style={styles.sendButton}>
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
