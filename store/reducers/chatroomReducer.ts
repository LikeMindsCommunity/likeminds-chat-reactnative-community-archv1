import {
  CLEAR_CHATROOM_CONVERSATION,
  CLEAR_CHATROOM_DETAILS,
  CLEAR_FILE_UPLOADING_MESSAGES,
  CLEAR_SELECTED_FILES_TO_UPLOAD,
  CLEAR_SELECTED_FILE_TO_VIEW,
  FIREBASE_CONVERSATIONS_SUCCESS,
  GET_CHATROOM_SUCCESS,
  GET_CONVERSATIONS_SUCCESS,
  LONG_PRESSED,
  MESSAGE_SENT,
  PAGINATED_CONVERSATIONS_SUCCESS,
  REACTION_SENT,
  SELECTED_FILES_TO_UPLOAD,
  SELECTED_FILES_TO_UPLOAD_THUMBNAILS,
  SELECTED_FILE_TO_VIEW,
  SELECTED_MESSAGES,
  SELECTED_MORE_FILES_TO_UPLOAD,
  SET_IS_REPLY,
  SET_POSITION,
  SET_REPLY_MESSAGE,
  UPDATE_CHAT_REQUEST_STATE,
  UPDATE_CONVERSATIONS,
} from '../types/types';

const initialState = {
  conversations: [],
  chatroomDetails: {} as any,
  messageSent: '' as any,
  isLongPress: false,
  selectedMessages: [],
  stateArr: [1, 2, 3, 7, 8, 9, 20, 19, 17], //states for person started, left, joined, added, removed messages, aceept DM, reject DM, turned to community manager.
  position: {x: 0, y: 0} as any,
  selectedFilesToUpload: [],
  selectedFilesToUploadThumbnails: [],
  selectedFileToView: {} as any,
  isReply: false,
  replyMessage: '',
};

export function chatroomReducer(state = initialState, action: any) {
  switch (action.type) {
    case LONG_PRESSED: {
      const isLongPressed = action.body;
      return {
        ...state,
        isLongPress: isLongPressed,
      };
    }
    case SELECTED_MESSAGES: {
      const selectedMessages = action.body;
      return {
        ...state,
        selectedMessages: selectedMessages,
      };
    }
    case GET_CONVERSATIONS_SUCCESS: {
      const {conversations = []} = action.body;
      let arr = conversations.reverse();
      return {...state, conversations: arr};
    }
    case PAGINATED_CONVERSATIONS_SUCCESS: {
      const {conversations = []} = action.body;
      let arr = conversations.reverse();
      return {...state, conversations: [...state.conversations, ...arr]};
    }
    case FIREBASE_CONVERSATIONS_SUCCESS: {
      const data = action.body;
      const {conversations = []} = data;
      let temporaryID = conversations[0]?.temporary_id;

      let conversationsList = [...state.conversations];
      let conversationArr: any = [...conversationsList];

      // index would be -1 if conversationsList is empty else it would have index of the element that needs to replaced
      let index = conversationsList.findIndex((element: any) => {
        return (
          element?.id?.toString() === temporaryID || // to check locally handled item id with temporaryID
          element?.temporary_id?.toString() === temporaryID // to replace the messsage if message is already there by verifying message's temporaryID with conversationMeta temporaryID;
        );
      });

      //replacing the value from the index that matches temporaryID
      if (conversations.length > 0 && index !== -1) {
        conversationArr[index] = conversations[0];
      }
      return {
        ...state,
        conversations:
          index === -1 && conversationsList.length > 0 // no such element present already && conversationsList length > 0
            ? [conversations[0], ...conversationArr]
            : conversationArr,
      };
    }
    case UPDATE_CONVERSATIONS: {
      const {obj} = action.body;
      return {...state, conversations: [obj, ...state.conversations]};
    }

    case CLEAR_CHATROOM_CONVERSATION: {
      const {conversations = []} = action.body;
      return {...state, conversations: conversations};
    }
    case GET_CHATROOM_SUCCESS: {
      const chatroomDetails = action.body;
      return {...state, chatroomDetails: chatroomDetails};
    }
    case CLEAR_CHATROOM_DETAILS: {
      const {chatroomDetails} = action.body;
      return {...state, chatroomDetails: chatroomDetails};
    }
    case UPDATE_CHAT_REQUEST_STATE: {
      const {chatRequestState} = action.body;
      return {
        ...state,
        chatroomDetails: {
          ...state.chatroomDetails,
          chatroom: {
            ...state.chatroomDetails.chatroom,
            chat_request_state: chatRequestState,
          },
        },
      };
    }
    case MESSAGE_SENT: {
      const {id: messageObj} = action.body;
      return {...state, messageSent: messageObj};
    }
    case REACTION_SENT: {
      const {previousMsg, changedMsg} = action.body;
      let index = state?.conversations.findIndex(
        (element: any) => element?.id === changedMsg?.id,
      );

      let arr = [...(state?.conversations as any)];
      if (index !== undefined || index !== -1) {
        arr[index] = changedMsg;
      }
      return {...state, conversations: [...arr]};
    }
    case SET_POSITION: {
      const {pageX, pageY} = action.body;
      return {...state, position: {x: pageX, y: pageY}};
    }
    case SELECTED_FILES_TO_UPLOAD: {
      const {images} = action.body;
      return {...state, selectedFilesToUpload: [...images]};
    }
    case SELECTED_FILES_TO_UPLOAD_THUMBNAILS: {
      const {images} = action.body;
      return {...state, selectedFilesToUploadThumbnails: [...images]};
    }
    case SELECTED_FILE_TO_VIEW: {
      const {image} = action.body;
      return {...state, selectedFileToView: image};
    }
    case SELECTED_MORE_FILES_TO_UPLOAD: {
      const {images} = action.body;
      return {
        ...state,
        selectedFilesToUpload: [...state.selectedFilesToUpload, ...images],
      };
    }
    case CLEAR_SELECTED_FILES_TO_UPLOAD: {
      return {...state, selectedFilesToUpload: []};
    }
    case CLEAR_SELECTED_FILE_TO_VIEW: {
      return {...state, selectedFileToView: {}};
    }
    case SET_IS_REPLY: {
      const {isReply = false} = action.body;
      return {...state, isReply: isReply};
    }
    case SET_REPLY_MESSAGE: {
      const {replyMessage = ''} = action.body;
      return {...state, replyMessage: replyMessage};
    }
    default:
      return state;
  }
}
