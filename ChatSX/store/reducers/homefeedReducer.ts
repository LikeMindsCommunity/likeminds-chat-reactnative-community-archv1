import Styles from '../../constants/Styles';
import {
  ACCEPT_INVITE_SUCCESS,
  GET_DMFEED_CHAT_SUCCESS,
  GET_HOMEFEED_CHAT_SUCCESS,
  GET_INVITES_SUCCESS,
  INIT_API_SUCCESS,
  PROFILE_DATA_SUCCESS,
  REJECT_INVITE_SUCCESS,
  SET_DM_PAGE,
  SET_PAGE,
  SHOW_TOAST,
  STATUS_BAR_STYLE,
  UPDATE_DMFEED_CHAT_SUCCESS,
  UPDATE_HOMEFEED_CHAT_SUCCESS,
  UPDATE_INVITES_SUCCESS,
  UPDATE_LAST_CONVERSATION,
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
    case GET_INVITES_SUCCESS: {
      const {user_invites = []} = action.body;
      return {
        ...state,
        invitedChatrooms: user_invites,
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
      const {user_invites = []} = action.body;
      return {
        ...state,
        invitedChatrooms: [...state.invitedChatrooms, ...user_invites],
      };
    }
    case GET_HOMEFEED_CHAT_SUCCESS: {
      const {my_chatrooms, unseen_chatroom_count, total_chatroom_count} =
        action.body;
      return {
        ...state,
        myChatrooms: my_chatrooms,
        totalCount: total_chatroom_count,
        unseenCount: unseen_chatroom_count,
      };
    }
    case UPDATE_HOMEFEED_CHAT_SUCCESS: {
      const {my_chatrooms = []} = action.body;
      return {...state, myChatrooms: [...state.myChatrooms, ...my_chatrooms]};
    }
    case GET_DMFEED_CHAT_SUCCESS: {
      const {dm_chatrooms} = action.body;
      return {
        ...state,
        myDMChatrooms: dm_chatrooms,
      };
    }
    case UPDATE_DMFEED_CHAT_SUCCESS: {
      const {dm_chatrooms = []} = action.body;
      return {
        ...state,
        myDMChatrooms: [...state.myDMChatrooms, ...dm_chatrooms],
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
          last_conversation: {
            ...chatroomObject?.last_conversation,
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
      const {member = {}, member_rights = []} = action.body;
      return {...state, user: member, memberRights: member_rights};
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
