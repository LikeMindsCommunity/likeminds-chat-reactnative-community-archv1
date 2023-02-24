import {GET_EXPLORE_FEED_CHAT_SUCCESS, UPDATE_EXPLORE_FEED_CHAT_SUCCESS} from '../types/types';

const initialState = {
  exploreChatrooms: [],
};

export function explorefeedReducer(state = initialState, action: any) {
  switch (action.type) {
    case GET_EXPLORE_FEED_CHAT_SUCCESS: {
      const {chatrooms = []} = action.body;
      return {...state, exploreChatrooms: chatrooms};
    }
    case UPDATE_EXPLORE_FEED_CHAT_SUCCESS: {
      const {chatrooms = []} = action.body;
      return {...state, exploreChatrooms: [...state.exploreChatrooms,chatrooms]};
    }
    default:
      return state;
  }
}
