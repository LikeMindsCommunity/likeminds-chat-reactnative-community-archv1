import {GET_CHATROOM_SUCCESS, GET_CONVERSATIONS_SUCCESS, UPDATE_CONVERSATIONS} from '../types/types';

const initialState = {
  conversations: [],
  chatroomDetails: {} as any
};

export function chatroomReducer(state = initialState, action: any) {
  switch (action.type) {
    case GET_CONVERSATIONS_SUCCESS: {
      const {conversations = []} = action.body;
      let arr = conversations.reverse();
      return {...state, conversations: arr};
    }
    case UPDATE_CONVERSATIONS: {
      const message = action.body;
      return {...state, conversations: [message, ...state.conversations]};
    }
    case GET_CHATROOM_SUCCESS: {
      const chatroomDetails = action.body;
      return {...state, chatroomDetails: chatroomDetails};
    }
    default:
      return state;
  }
}
