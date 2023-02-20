import {CALL_API} from '../apiMiddleware';
import {Alert} from 'react-native';
import {
  GET_HOMEFEED_CHAT,
  GET_HOMEFEED_CHAT_FAILED,
  GET_HOMEFEED_CHAT_SUCCESS,
} from '../types/types';
import {myClient} from '../..';
import { Dispatch } from '@reduxjs/toolkit';

export const getHomeFeedData = (payload: any) => (async (dispatch: Dispatch) => {
  try {
    return await dispatch({
      type: GET_HOMEFEED_CHAT_SUCCESS,
      [CALL_API]: {
        func: myClient.getHomeFeedData(payload),
        body: payload,
        types: [
          GET_HOMEFEED_CHAT,
          GET_HOMEFEED_CHAT_SUCCESS,
          GET_HOMEFEED_CHAT_FAILED,
        ],
        showLoader: true,
      },
    });
  } catch (error) {
    Alert.alert(`${error}`);
  }
});

// export const getProducts = () => async dispatch => {
//   try {
//     return await dispatch({
//       [CALL_API]: {
//         url: '/products',
//         method: 'GET',
//         types: [GET_PRODUCTS, GET_PRODUCTS_SUCCESS, GET_PRODUCTS_FAILED],
//         showLoader: true,
//       },
//     });
//   } catch (error) {
//     Alert.alert(`${error}`);
//   }
// };

// export const getProductDetails = id => async dispatch => {
//   try {
//     return await dispatch({
//       [CALL_API]: {
//         url: `/products/${id}`,
//         method: 'GET',
//         // types: [GET_PRODUCTS, GET_PRODUCTS_SUCCESS, GET_PRODUCTS_FAILED],
//         showLoader: true,
//       },
//     });
//   } catch (error) {
//     Alert.alert(`${error}`);
//   }
// };

// export const setCategories = name => {
//   return {type: SET_CATEGORIES_SUCCESS, body: name};
// };

// export const removeCategories = name => {
//   return {type: REMOVE_CATEGORIES_SUCCESS, body: name};
// };

// export function savePreferences(settings) {
//   return {body: settings, type: SAVE_PREFERENCES};
// }
