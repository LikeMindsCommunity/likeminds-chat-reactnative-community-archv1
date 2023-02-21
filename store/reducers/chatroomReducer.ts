import {GET_CONVERSATIONS_SUCCESS, UPDATE_CONVERSATIONS} from '../types/types';

const initialState = {
  conversations: [],
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
      console.log('message',message)
      // let arr = conversations.reverse();
      return {...state, conversations: [message, ...state.conversations]};
    }
    default:
      return state;
  }
}
