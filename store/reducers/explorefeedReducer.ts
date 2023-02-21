import {GET_EXPLORE_FEED_CHAT_SUCCESS} from '../types/types';

const initialState = {
  exploreChatrooms: [],
};

export function explorefeedReducer(state = initialState, action: any) {
  switch (action.type) {
    case GET_EXPLORE_FEED_CHAT_SUCCESS: {
      const {chatrooms = []} = action.body;
    //   console.log('chatrooms', chatrooms);
      return {...state, exploreChatrooms: chatrooms};
    }
    default:
      return state;
  }
}
