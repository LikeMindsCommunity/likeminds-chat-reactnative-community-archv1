import {
  GET_HOMEFEED_CHAT_SUCCESS,
  INIT_API_SUCCESS,
  UPDATE_HOMEFEED_CHAT_SUCCESS,
} from '../types/types';

const initialState = {
  myChatrooms: [],
  user: {} as any,
  community: {} as any,
  unseenCount: null,
  totalCount: null,
};

export function homefeedReducer(state = initialState, action: any) {
  switch (action.type) {
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
      const {user, community} = action.body;
      return {...state, user: user, community: community};
    }
    default:
      return state;
  }
}
