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
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import {useAppDispatch, useAppSelector} from '../../store';
import {onConversationsCreate} from '../../store/actions/chatroom';
import {
  MESSAGE_SENT,
  SHOW_TOAST,
  UPDATE_CHAT_REQUEST_STATE,
  UPDATE_CONVERSATIONS,
} from '../../store/types/types';
import {ReplyBox} from '../ReplyConversations';
import {chatSchema} from '../../assets/chatSchema';
import {myClient} from '../..';
import {DM_REQUEST_MESSAGE, SEND_DM_REQUEST} from '../../constants/Strings';

interface InputBox {
  isReply: boolean;
  replyChatID: any;
  chatroomID: any;
  replyMessage: any;
  setIsReply: any;
  setReplyMessage: any;
  chatRequestState?: any;
  chatroomType?: any;
}

const InputBox = ({
  isReply,
  replyChatID,
  chatroomID,
  replyMessage,
  setIsReply,
  setReplyMessage,
  chatRequestState,
  chatroomType,
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
    let ID = Date.now();

    // check if message is empty string or not
    if (!!message.trim()) {
      let replyObj = chatSchema.reply;
      if (isReply) {
        replyObj.reply_conversation = replyMessage?.id;
        replyObj.reply_conversation_object = replyMessage;
        replyObj.member.name = user?.name;
        replyObj.member.id = user?.id;
        replyObj.answer = message.trim();
        replyObj.created_at = `${hr.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}:${min.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })}`;
        replyObj.id = ID;
        replyObj.chatroom_id = chatroomDetails?.chatroom.id;
        replyObj.community_id = community?.id;
        replyObj.date = `${
          time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
        } ${months[time.getMonth()]} ${time.getFullYear()}`;
      }
      let obj = chatSchema.normal;
      obj.member.name = user?.name;
      obj.member.id = user?.id;
      obj.answer = message.trim();
      obj.created_at = `${hr.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}:${min.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })}`;
      obj.id = ID;
      obj.chatroom_id = chatroomDetails?.chatroom.id;
      obj.community_id = community?.id;
      obj.date = `${
        time.getDate() < 10 ? `0${time.getDate()}` : time.getDate()
      } ${months[time.getMonth()]} ${time.getFullYear()}`;

      dispatch({
        type: UPDATE_CONVERSATIONS,
        body: isReply ? {obj: {...replyObj}} : {obj: {...obj}},
      });
      dispatch({
        type: MESSAGE_SENT,
        body: isReply ? {id: replyObj?.id} : {id: obj?.id},
      });
      setMessage('');
      setIsReply(false);

      setInputHeight(25);
      setReplyMessage();

      // -- Code for local message handling ended

      // condition for request DM for the first time
      if (chatroomType === 10 && chatRequestState === null) {
        let response = await myClient.requestDmAction({
          chatroom_id: chatroomID,
          chat_request_state: 0,
          text: message.trim(),
        });

        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: 'Direct messaging request sent'},
        });

        //dispatching redux action for local handling of chatRequestState
        dispatch({
          type: UPDATE_CHAT_REQUEST_STATE,
          body: {chatRequestState: 0},
        });
      } else {
        let payload = {
          chatroom_id: chatroomID,
          created_at: new Date(Date.now()),
          has_files: false,
          text: message.trim(),
          temporary_id: ID,
          // attachment_count?: any;
          replied_conversation_id: replyMessage?.id,
        };
        let response = await dispatch(onConversationsCreate(payload) as any);
      }
    }
  };

  // function calls a confirm alert which will further call onSend function onConfirm.
  const sendDmRequest = () => {
    Alert.alert(
      SEND_DM_REQUEST,
      DM_REQUEST_MESSAGE,
      [
        {
          text: 'Cancel',
          style: 'default',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            onSend();
          },
          style: 'default',
        },
      ],
      {
        cancelable: false,
      },
    );
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

        <TouchableOpacity
          onPressOut={() => {
            if (chatroomType === 10 && chatRequestState === null) {
              sendDmRequest();
            } else {
              onSend();
            }
          }}
          style={styles.sendButton}>
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
