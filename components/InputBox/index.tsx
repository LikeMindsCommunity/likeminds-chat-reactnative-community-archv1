import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  Modal,
  Pressable,
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {onConversationsCreate} from '../../store/actions/chatroom';
import {MESSAGE_SENT, UPDATE_CONVERSATIONS} from '../../store/types/types';
import {ReplyBox} from '../ReplyConversations';
import {chatSchema} from '../../assets/chatSchema';
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
  const [inputHeight, setInputHeight] = useState(25);
  const [showEmoji, setShowEmoji] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const dispatch = useAppDispatch();
  const {myChatrooms, user, community} = useAppSelector(
    state => state.homefeed,
  );
  const {chatroomDetails} = useAppSelector(state => state.chatroom);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyBoardFocused(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyBoardFocused(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const onSend = async () => {
    // -- Code for local message handling for normal and reply for now
    let months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    let time = new Date(Date.now());
    let hr = time.getHours();
    let min = time.getMinutes();
    if (!!message.trim()) {
      let replyObj = chatSchema.reply;
      if (isReply) {
        replyObj.reply_conversation = replyMessage?.id;
        replyObj.reply_conversation_object = replyMessage;
        replyObj.member.name = user?.name;
        replyObj.answer = message;
        replyObj.created_at = `${hr.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}:${min.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}`;
        replyObj.id = Date.now();
        replyObj.chatroom_id = chatroomDetails?.chatroom.id;
        replyObj.community_id = community?.id;
        replyObj.date = `${time.getDate()} ${
          months[time.getMonth()]
        } ${time.getFullYear()}`;
        console.log('DATE.NOW =',Date.now(), replyObj.id)
      }
      let obj = chatSchema.normal;
      obj.member.name = user?.name;
      obj.answer = message;
      obj.created_at = `${hr.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}:${min.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;
      obj.id = Date.now();
      obj.chatroom_id = chatroomDetails?.chatroom.id;
      obj.community_id = community?.id;
      obj.date = `${time.getDate()} ${
        months[time.getMonth()]
      } ${time.getFullYear()}`;

      dispatch({
        type: UPDATE_CONVERSATIONS,
        body: isReply ? replyObj : obj,
      });
      dispatch({
        type: MESSAGE_SENT,
        body: isReply ? replyObj?.id : obj?.id,
      });
      setMessage('');
      setIsReply(false);

      setInputHeight(25);
      setReplyMessage();

      // -- Code for local message handling ended

      let payload = {
        chatroom_id: chatroomID,
        created_at: new Date(Date.now()),
        has_files: false,
        text: message.trim(),
        // attachment_count?: any;
        replied_conversation_id: replyMessage?.id,
      };
      let response = await dispatch(onConversationsCreate(payload) as any);
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

            <View style={[styles.inputParent]}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                onContentSizeChange={event => {
                  setInputHeight(event.nativeEvent.contentSize.height);
                }}
                style={[styles.input, {height: Math.max(25, inputHeight)}]}
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
