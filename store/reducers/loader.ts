import {
  START_CHATROOM_LOADING,
  START_LOADING,
  STOP_CHATROOM_LOADING,
  STOP_LOADING,
} from '../types/loader';

const initialState = {
  count: 0,
  chatroomCount: 0,
};

export function loader(state = initialState, action: any) {
  switch (action.type) {
    case START_LOADING: {
      return {...state, count: ++state.count};
    }
    case STOP_LOADING: {
      return {...state, count: Math.max(0, --state.count)};
    }
    case START_CHATROOM_LOADING: {
      return {...state, chatroomCount: ++state.chatroomCount};
    }
    case STOP_CHATROOM_LOADING: {
      return {...state, chatroomCount: Math.max(0, --state.chatroomCount)};
    }
    default:
      return state;
  }
}
