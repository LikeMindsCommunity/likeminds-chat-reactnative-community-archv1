import {
  GET_HOMEFEED_CHAT_SUCCESS,
  INIT_API_SUCCESS,
  PROFILE_DATA_SUCCESS,
  SET_PAGE,
  UPDATE_HOMEFEED_CHAT_SUCCESS,
} from '../types/types';

const initialState = {
  myChatrooms: [],
  user: {} as any,
  community: {} as any,
  unseenCount: null,
  totalCount: null,
  page: 1 as number,
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
    default:
      return state;
  }
}
