import {GET_CONVERSATIONS_SUCCESS} from '../types/types';

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
    default:
      return state;
  }
}
