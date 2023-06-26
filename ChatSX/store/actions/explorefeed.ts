import {CALL_API} from '../apiMiddleware';
import {Alert} from 'react-native';
import {
  GET_EXPLORE_FEED_CHAT,
  GET_EXPLORE_FEED_CHAT_FAILED,
  GET_EXPLORE_FEED_CHAT_SUCCESS,
  UPDATE_EXPLORE_FEED_CHAT,
  UPDATE_EXPLORE_FEED_CHAT_FAILED,
  UPDATE_EXPLORE_FEED_CHAT_SUCCESS,
} from '../types/types';
import {myClient} from '../../..';
import {Dispatch} from '@reduxjs/toolkit';

export const getExploreFeedData =
  (payload: any, showLoader?: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: GET_EXPLORE_FEED_CHAT_SUCCESS,
        [CALL_API]: {
          func: myClient?.getExploreFeed(payload),
          body: payload,
          types: [
            GET_EXPLORE_FEED_CHAT,
            GET_EXPLORE_FEED_CHAT_SUCCESS,
            GET_EXPLORE_FEED_CHAT_FAILED,
          ],
          showLoader: showLoader ? showLoader : false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const updateExploreFeedData =
  (payload: any) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: UPDATE_EXPLORE_FEED_CHAT_SUCCESS,
        [CALL_API]: {
          func: myClient?.getExploreFeed(payload),
          body: payload,
          types: [
            UPDATE_EXPLORE_FEED_CHAT,
            UPDATE_EXPLORE_FEED_CHAT_SUCCESS,
            UPDATE_EXPLORE_FEED_CHAT_FAILED,
          ],
          showLoader: false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };
