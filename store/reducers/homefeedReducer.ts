import {GET_HOMEFEED_CHAT_SUCCESS} from '../types/types';

const initialState = {
  myChatrooms: [],
};

export function homefeedReducer(state = initialState, action: any) {
  switch (action.type) {
    case GET_HOMEFEED_CHAT_SUCCESS: {
      const {my_chatrooms = []} = action.body;
      return {...state, myChatrooms: my_chatrooms};
    }
    default:
      return state;
  }
}
