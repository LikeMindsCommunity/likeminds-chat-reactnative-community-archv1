import {CALL_API} from '../apiMiddleware';
import {Alert} from 'react-native';
import {
  ACCEPT_INVITE,
  ACCEPT_INVITE_FAILED,
  ACCEPT_INVITE_SUCCESS,
  GET_DMFEED_CHAT,
  GET_DMFEED_CHAT_FAILED,
  GET_DMFEED_CHAT_SUCCESS,
  GET_HOMEFEED_CHAT,
  GET_HOMEFEED_CHAT_FAILED,
  GET_HOMEFEED_CHAT_SUCCESS,
  GET_INVITES,
  GET_INVITES_FAILED,
  GET_INVITES_SUCCESS,
  INIT_API,
  INIT_API_FAILED,
  INIT_API_SUCCESS,
  PROFILE_DATA,
  PROFILE_DATA_FAILED,
  PROFILE_DATA_SUCCESS,
  REJECT_INVITE,
  REJECT_INVITE_FAILED,
  REJECT_INVITE_SUCCESS,
  UPDATE_DMFEED_CHAT,
  UPDATE_DMFEED_CHAT_FAILED,
  UPDATE_DMFEED_CHAT_SUCCESS,
  UPDATE_HOMEFEED_CHAT,
  UPDATE_HOMEFEED_CHAT_FAILED,
  UPDATE_HOMEFEED_CHAT_SUCCESS,
  UPDATE_INVITES,
  UPDATE_INVITES_FAILED,
  UPDATE_INVITES_SUCCESS,
} from '../types/types';
import {myClient} from '../../..';
import {Dispatch} from '@reduxjs/toolkit';

export const initAPI = (payload: any) => async (dispatch: Dispatch) => {
  try {
    const temp = await dispatch({
      type: INIT_API_SUCCESS,
      [CALL_API]: {
        func: myClient?.initiateUser(payload),
        body: payload,
        types: [INIT_API, INIT_API_SUCCESS, INIT_API_FAILED],
        showLoader: true,
      },
    });
    return temp;
  } catch (error) {
    Alert.alert(`${error}`);
  }
};

export const getMemberState = (payload?: any) => async (dispatch: Dispatch) => {
  try {
    return await dispatch({
      type: PROFILE_DATA_SUCCESS,
      [CALL_API]: {
        func: myClient?.getMemberState(),
        body: payload,
        types: [PROFILE_DATA, PROFILE_DATA_SUCCESS, PROFILE_DATA_FAILED],
        showLoader: true,
      },
    });
  } catch (error) {
    Alert.alert(`${error}`);
  }
};

export const getInvites =
  (payload: any, showLoader?: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: GET_INVITES_SUCCESS,
        [CALL_API]: {
          func: myClient?.getInvites(payload),
          body: payload,
          types: [GET_INVITES, GET_INVITES_SUCCESS, GET_INVITES_FAILED],
          showLoader: showLoader,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const updateInvites =
  (payload: any, showLoader?: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: UPDATE_INVITES_SUCCESS,
        [CALL_API]: {
          func: myClient?.getInvites(payload),
          body: payload,
          types: [
            UPDATE_INVITES,
            UPDATE_INVITES_SUCCESS,
            UPDATE_INVITES_FAILED,
          ],
          showLoader: showLoader,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

// export const acceptInvite = (payload: any, showLoader?:boolean) => (async (dispatch: Dispatch) => {
//   try {
//     return await dispatch({
//       type: ACCEPT_INVITE_SUCCESS,
//       [CALL_API]: {
//         func: myClient?.inviteAction(payload),
//         body: payload,
//         types: [
//           ACCEPT_INVITE,
//           ACCEPT_INVITE_SUCCESS,
//           ACCEPT_INVITE_FAILED,
//         ],
//         showLoader: showLoader,
//       },
//     });
//   } catch (error) {
//     Alert.alert(`${error}`)
//   }
// });

// export const rejectInvite = (payload: any, showLoader?:boolean) => (async (dispatch: Dispatch) => {
//   try {
//     return await dispatch({
//       type: REJECT_INVITE_SUCCESS,
//       [CALL_API]: {
//         func: myClient?.inviteAction(payload),
//         body: payload,
//         types: [
//           REJECT_INVITE,
//           REJECT_INVITE_SUCCESS,
//           REJECT_INVITE_FAILED,
//         ],
//         showLoader: showLoader,
//       },
//     });
//   } catch (error) {
//     Alert.alert(`${error}`)
//   }
// });

export const getHomeFeedData =
  (payload: any, showLoader?: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: GET_HOMEFEED_CHAT_SUCCESS,
        [CALL_API]: {
          func: myClient?.getHomeFeed(payload),
          body: payload,
          types: [
            GET_HOMEFEED_CHAT,
            GET_HOMEFEED_CHAT_SUCCESS,
            GET_HOMEFEED_CHAT_FAILED,
          ],
          showLoader: showLoader ? true : false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const updateHomeFeedData =
  (payload: any, showLoader?: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: UPDATE_HOMEFEED_CHAT_SUCCESS,
        [CALL_API]: {
          func: myClient?.getHomeFeed(payload),
          body: payload,
          types: [
            UPDATE_HOMEFEED_CHAT,
            UPDATE_HOMEFEED_CHAT_SUCCESS,
            UPDATE_HOMEFEED_CHAT_FAILED,
          ],
          showLoader: showLoader != undefined ? false : true,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const getDMFeedData =
  (payload: any, showLoader?: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: GET_DMFEED_CHAT_SUCCESS,
        [CALL_API]: {
          func: myClient?.fetchDMFeed(payload),
          body: payload,
          types: [
            GET_DMFEED_CHAT,
            GET_DMFEED_CHAT_SUCCESS,
            GET_DMFEED_CHAT_FAILED,
          ],
          showLoader: showLoader ? true : false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };

export const updateDMFeedData =
  (payload: any, showLoader?: boolean) => async (dispatch: Dispatch) => {
    try {
      return await dispatch({
        type: UPDATE_DMFEED_CHAT_SUCCESS,
        [CALL_API]: {
          func: myClient?.fetchDMFeed(payload),
          body: payload,
          types: [
            UPDATE_DMFEED_CHAT,
            UPDATE_DMFEED_CHAT_SUCCESS,
            UPDATE_DMFEED_CHAT_FAILED,
          ],
          showLoader: showLoader ? true : false,
        },
      });
    } catch (error) {
      Alert.alert(`${error}`);
    }
  };
