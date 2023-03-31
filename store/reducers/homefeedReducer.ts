import {
  ACCEPT_INVITE_SUCCESS,
  GET_HOMEFEED_CHAT_SUCCESS,
  GET_INVITES_SUCCESS,
  INIT_API_SUCCESS,
  PROFILE_DATA_SUCCESS,
  REJECT_INVITE_SUCCESS,
  SET_PAGE,
  SHOW_TOAST,
  UPDATE_HOMEFEED_CHAT_SUCCESS,
  UPDATE_INVITES_SUCCESS,
} from '../types/types';

const initialState = {
  myChatrooms: [] as any,
  invitedChatrooms: [] as any,
  user: {} as any,
  community: {} as any,
  unseenCount: null,
  totalCount: null,
  page: 1 as number,
  isToast: false as boolean,
  toastMessage: '' as string,
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
    case GET_INVITES_SUCCESS: {
      const {user_invites} = action.body;
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
      const {user_invites} = action.body;
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
    case INIT_API_SUCCESS: {
      const {community} = action.body;
      return {...state, community: community};
    }
    case PROFILE_DATA_SUCCESS: {
      const {member} = action.body;
      return {...state, user: member};
    }
    case SHOW_TOAST: {
      const {isToast, msg} = action.body;
      return {...state, isToast: isToast, toastMessage: msg};
    }
    default:
      return state;
  }
}
