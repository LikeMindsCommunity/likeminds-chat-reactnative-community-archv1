import {
  GET_EXPLORE_FEED_CHAT_SUCCESS,
  SET_EXPLORE_FEED_PAGE,
  UPDATE_EXPLORE_FEED_CHAT_SUCCESS,
} from '../types/types';

const initialState = {
  exploreChatrooms: [],
  page: 1,
  pinnedChatroomsCount: 0,
};

export function explorefeedReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_EXPLORE_FEED_PAGE: {
      const page = action.body;
      return {
        ...state,
        page: page,
      };
    }
    case GET_EXPLORE_FEED_CHAT_SUCCESS: {
      const {chatrooms = [], pinnedChatroomsCount} = action.body;
      return {
        ...state,
        exploreChatrooms: chatrooms,
        pinnedChatroomsCount: pinnedChatroomsCount,
      };
    }
    case UPDATE_EXPLORE_FEED_CHAT_SUCCESS: {
      const {chatrooms = []} = action.body;
      return {
        ...state,
        exploreChatrooms: [...state.exploreChatrooms, ...chatrooms],
      };
    }
    default:
      return state;
  }
}
