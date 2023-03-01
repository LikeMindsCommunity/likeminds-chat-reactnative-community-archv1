import {START_LOADING, STOP_LOADING} from '../types/loader';

const initialState = {
  count: 0,
};

export function loader(state = initialState, action) {
  switch (action.type) {
    case START_LOADING: {
      return {...state, count: ++state.count};
    }
    case STOP_LOADING: {
      return {...state, count: Math.max(0, --state.count)};
    }
    default:
      return state;
  }
}