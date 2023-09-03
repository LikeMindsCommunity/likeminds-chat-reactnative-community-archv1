import Styles from '../../constants/Styles';
import {
  ACCEPT_INVITE_SUCCESS,
  GET_DMFEED_CHAT_SUCCESS,
  GET_HOMEFEED_CHAT_SUCCESS,
  GET_INVITES_SUCCESS,
  INIT_API_SUCCESS,
  PROFILE_DATA_SUCCESS,
  GET_SYNC_HOMEFEED_CHAT_SUCCESS,
  REJECT_INVITE_SUCCESS,
  SET_DM_PAGE,
  SET_PAGE,
  SHOW_TOAST,
  STATUS_BAR_STYLE,
  UPDATE_DMFEED_CHAT_SUCCESS,
  UPDATE_HOMEFEED_CHAT_SUCCESS,
  UPDATE_INVITES_SUCCESS,
  UPDATE_LAST_CONVERSATION,
  TO_BE_DELETED,
} from '../types/types';

const initialState = {
  myChatrooms: [] as any,
  myDMChatrooms: [] as any,
  invitedChatrooms: [] as any,
  user: {} as any,
  memberRights: [],
  community: {} as any,
  unseenCount: null,
  totalCount: null,
  page: 1 as number,
  dmPage: 1 as number,
  isToast: false as boolean,
  toastMessage: '' as string,
  statusBarStyle: Styles.$STATUS_BAR_STYLE.default,
};

export function homefeedReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_PAGE: {
      const page = action.body;
      return {
        ...state,
        page: page,
      };
    }
    case SET_DM_PAGE: {
      const page = action.body;
      return {
        ...state,
        dmPage: page,
      };
    }
    case TO_BE_DELETED: {
      const chatroomId = action.body;
      const clonedChatrooms = state.myChatrooms;
      for (let i = 0; i < clonedChatrooms.length; i++) {
        const chatroom = clonedChatrooms[i];
        if (chatroom.id == chatroomId) {
          console.log('chatroomSeletedId', chatroom.id);
          clonedChatrooms.splice(i, 1);
          break;
        }
      }
      return {
        ...state,
        myChatrooms: clonedChatrooms,
        totalCount: clonedChatrooms.length,
      };
    }
    case GET_SYNC_HOMEFEED_CHAT_SUCCESS: {
      const myChatrooms = action.body;
      return {
        ...state,
        myChatrooms: myChatrooms,
        totalCount: myChatrooms.length,
      };
    }
    case GET_INVITES_SUCCESS: {
      const {userInvites = []} = action.body;
      return {
        ...state,
        invitedChatrooms: userInvites,
      };
    }
    case ACCEPT_INVITE_SUCCESS: {
      const chatroomID = action.body;
      let filteredInvites = state.invitedChatrooms.filter((val: any) => {
        return val?.chatroom?.id !== chatroomID;
      });
      return {
        ...state,
        invitedChatrooms: filteredInvites,
      };
    }
    case REJECT_INVITE_SUCCESS: {
      const chatroomID = action.body;
      let filteredInvites = state.invitedChatrooms.filter((val: any) => {
        return val?.chatroom?.id !== chatroomID;
      });
      return {
        ...state,
        invitedChatrooms: filteredInvites,
      };
    }
    case UPDATE_INVITES_SUCCESS: {
      const {userInvites = []} = action.body;
      return {
        ...state,
        invitedChatrooms: [...state.invitedChatrooms, ...userInvites],
      };
    }
    case GET_HOMEFEED_CHAT_SUCCESS: {
      const {myChatrooms, unseenChatroomCount, totalChatroomCount} =
        action.body;
      return {
        ...state,
        myChatrooms: myChatrooms,
        totalCount: totalChatroomCount,
        unseenCount: unseenChatroomCount,
      };
    }
    case UPDATE_HOMEFEED_CHAT_SUCCESS: {
      const {myChatrooms = []} = action.body;
      return {...state, myChatrooms: [...state.myChatrooms, ...myChatrooms]};
    }
    case GET_DMFEED_CHAT_SUCCESS: {
      const {dmChatrooms} = action.body;
      return {
        ...state,
        myDMChatrooms: dmChatrooms,
      };
    }
    case UPDATE_DMFEED_CHAT_SUCCESS: {
      const {dmChatrooms = []} = action.body;
      return {
        ...state,
        myDMChatrooms: [...state.myDMChatrooms, ...dmChatrooms],
      };
    }
    case UPDATE_LAST_CONVERSATION: {
      const {lastConversationAnswer, chatroomType, chatroomID} = action.body;

      let isDM = chatroomType === 10 ? true : false;
      let chatroomList = isDM ? state?.myDMChatrooms : state?.myChatrooms;
      let index = chatroomList.findIndex((element: any) => {
        return element?.chatroom?.id == chatroomID;
      });

      let arr = [...(chatroomList as any)];
      if (index !== undefined || index !== -1) {
        let chatroomObject = arr[index];
        arr[index] = {
          ...chatroomObject,
          lastConversation: {
            ...chatroomObject?.lastConversation,
            answer: lastConversationAnswer,
          },
        };
      }
      return {
        ...state,
        myChatrooms: isDM ? state?.myChatrooms : [...arr],
        myDMChatrooms: isDM ? [...arr] : state?.myDMChatrooms,
      };
    }
    case INIT_API_SUCCESS: {
      const {community = {}} = action.body;
      return {...state, community: community};
    }
    case PROFILE_DATA_SUCCESS: {
      const {member = {}, memberRights = []} = action.body;
      return {...state, user: member, memberRights: memberRights};
    }
    case SHOW_TOAST: {
      const {isToast, msg} = action.body;
      return {...state, isToast: isToast, toastMessage: msg};
    }
    case STATUS_BAR_STYLE: {
      const {color} = action.body;
      return {...state, statusBarStyle: color};
    }
    default:
      return state;
  }
}
