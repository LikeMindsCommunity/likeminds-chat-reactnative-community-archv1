import {Alert} from 'react-native';
import {Middleware} from '@reduxjs/toolkit';
import {START_LOADING, STOP_LOADING} from './types/loader';
import {myClient} from '..';

export const NETWORK_FAILED = 'Network request failed';

type FuncType = (payload: any) => Promise<Response>;

async function invokeAPI(func: Function, payload: any) {
  const response = await func;
  return response;
}

export const CALL_API = 'Call API';

const apiMiddleware: Middleware = store => next => async action => {
  // So the middleware doesn't get applied to every single action
  if (typeof action[CALL_API] === 'undefined') {
    return next(action);
  }

  const {func, types = [], showLoader = false, body} = action[CALL_API];

  const [requestType, successType, errorType] = types;

  //   const { authReducer: auth } = store.getState();
  requestType && next({type: requestType});
  try {
    if (showLoader) {
      next({type: START_LOADING});
      //TODO: Dispatch show modal loader now.
    }

    const responseBody = await invokeAPI(func, JSON.stringify(body));

    successType &&
      next({
        body: {...responseBody},
        type: successType,
      });

    return responseBody;
  } catch (error: any) {
    if (Number(error.message) === 401) {
      //   next({ type: USER_LOGOUT_SUCCESS });
    } else {
      if (error.message === NETWORK_FAILED) {
        Alert.alert('', 'Please check your internet connection');
      } else {
        throw error.message;
      }
    }
  } finally {
    if (showLoader) {
      next({type: STOP_LOADING});
      //TODO: Dispatch hide modal loader now.
    }
  }
};

export default apiMiddleware;
