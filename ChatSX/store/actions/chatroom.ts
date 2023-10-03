import {Dispatch} from '@reduxjs/toolkit';
import {Alert} from 'react-native';
import {myClient} from '../../..';
import {CALL_API} from '../apiMiddleware';
import {
  GET_CHATROOM,
  GET_CHATROOM_SUCCESS,
  GET_CHATROOM_FAILED,
  GET_CONVERSATIONS,
  GET_CONVERSATIONS_FAILED,
  GET_CONVERSATIONS_SUCCESS,
  ON_CONVERSATIONS_CREATE,
  ON_CONVERSATIONS_CREATE_FAILED,
  ON_CONVERSATIONS_CREATE_SUCCESS,
  PAGINATED_CONVERSATIONS_END_SUCCESS,
  PAGINATED_CONVERSATIONS,
  PAGINATED_CONVERSATIONS_FAILED,
  FIREBASE_CONVERSATIONS,
  FIREBASE_CONVERSATIONS_SUCCESS,
  FIREBASE_CONVERSATIONS_FAILED,
  PAGINATED_CONVERSATIONS_START_SUCCESS,
  PAGINATED_CONVERSATIONS_SUCCESS,
  GET_CHATROOM_ACTIONS_SUCCESS,
} from '../types/types';

export const getConversations =
  (payload: any, showLoader: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: GET_CONVERSATIONS_SUCCESS,
        [CALL_API]: {
          func: myClient?.getConversations(payload),
          body: payload,
          types: [
            GET_CONVERSATIONS,
            GET_CONVERSATIONS_SUCCESS,
            GET_CONVERSATIONS_FAILED,
          ],
          showLoader: showLoader,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const paginatedConversationsEnd =
  (payload: any, showLoader: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: PAGINATED_CONVERSATIONS_END_SUCCESS,
        [CALL_API]: {
          func: myClient?.getConversations(payload),
          body: payload,
          types: [
            PAGINATED_CONVERSATIONS,
            PAGINATED_CONVERSATIONS_END_SUCCESS,
            PAGINATED_CONVERSATIONS_FAILED,
          ],
          showLoader: false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const paginatedConversationsStart =
  (payload: any, showLoader: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: PAGINATED_CONVERSATIONS_START_SUCCESS,
        [CALL_API]: {
          func: myClient?.getConversations(payload),
          body: payload,
          types: [
            PAGINATED_CONVERSATIONS,
            PAGINATED_CONVERSATIONS_START_SUCCESS,
            PAGINATED_CONVERSATIONS_FAILED,
          ],
          showLoader: false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const paginatedConversations =
  (payload: any, showLoader: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: PAGINATED_CONVERSATIONS_SUCCESS,
        [CALL_API]: {
          func: myClient?.getConversations(payload),
          body: payload,
          types: [
            PAGINATED_CONVERSATIONS,
            PAGINATED_CONVERSATIONS_SUCCESS,
            PAGINATED_CONVERSATIONS_FAILED,
          ],
          showLoader: false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const firebaseConversation =
  (payload: any, showLoader: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: FIREBASE_CONVERSATIONS_SUCCESS,
        [CALL_API]: {
          func: myClient?.getConversationMeta(payload),
          body: payload,
          types: [
            FIREBASE_CONVERSATIONS,
            FIREBASE_CONVERSATIONS_SUCCESS,
            FIREBASE_CONVERSATIONS_FAILED,
          ],
          showLoader: false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const onConversationsCreate =
  (payload: any, showLoader?: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: ON_CONVERSATIONS_CREATE_SUCCESS,
        [CALL_API]: {
          func: myClient?.postConversation(payload),
          body: payload,
          types: [
            ON_CONVERSATIONS_CREATE,
            ON_CONVERSATIONS_CREATE_SUCCESS,
            ON_CONVERSATIONS_CREATE_FAILED,
          ],
          showLoader: showLoader != undefined ? true : false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const getChatroom = (payload: any) => async (dispatch: Dispatch) => {
  try {
    return await dispatch({
      type: GET_CHATROOM_ACTIONS_SUCCESS,
      [CALL_API]: {
        func: myClient?.getChatroomActions(payload),
        body: payload,
        types: [
          GET_CHATROOM,
          GET_CHATROOM_ACTIONS_SUCCESS,
          GET_CHATROOM_FAILED,
        ],
        showLoader: false,
      },
    });
  } catch (error) {
    Alert.alert(`${error}`);
  }
};
