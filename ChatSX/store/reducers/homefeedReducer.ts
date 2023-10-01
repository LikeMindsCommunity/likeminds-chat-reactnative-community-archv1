import {current} from '@reduxjs/toolkit';
import Styles from '../../constants/Styles';
import {
  ACCEPT_INVITE_SUCCESS,
  GET_DMFEED_CHAT_SUCCESS,
  GET_HOMEFEED_CHAT_SUCCESS,
  GET_INVITES_SUCCESS,
  INIT_API_SUCCESS,
  PROFILE_DATA_SUCCESS,
  GET_SYNC_HOMEFEED_CHAT_SUCCESS,
  REJECT_INVITE_SUCCESS,
  SET_DM_PAGE,
  SET_PAGE,
  SHOW_TOAST,
  STATUS_BAR_STYLE,
  UPDATE_DMFEED_CHAT_SUCCESS,
  UPDATE_HOMEFEED_CHAT_SUCCESS,
  UPDATE_INVITES_SUCCESS,
  UPDATE_LAST_CONVERSATION,
  TO_BE_DELETED,
  SET_INITIAL_GROUPFEED_CHATROOM,
  INSERT_GROUPFEED_CHATROOM,
  INSERT_DMFEED_CHATROOM,
  UPDATE_GROUPFEED_CHATROOM,
  UPDATE_DMFEED_CHATROOM,
  SET_INITIAL_DMFEED_CHATROOM,
  DELETE_GROUPFEED_CHATROOM,
  DELETE_DMFEED_CHATROOM,
} from '../types/types';

const initialState = {
  myChatrooms: [] as any,
  myDMChatrooms: [] as any,
  invitedChatrooms: [] as any,
  user: {} as any,
  memberRights: [],
  community: {} as any,
  unseenCount: null,
  totalCount: null,
  page: 1 as number,
  dmPage: 1 as number,
  isToast: false as boolean,
  toastMessage: '' as string,
  statusBarStyle: Styles.$STATUS_BAR_STYLE.default,
  groupFeedChatrooms: [] as any,
  dmFeedChatrooms: [] as any,
};

export function homefeedReducer(state = initialState, action: any) {
  switch (action?.type) {
    case SET_PAGE: {
      const page = action.body;
      return {
        ...state,
        page: page,
      };
    }
    case SET_DM_PAGE: {
      const page = action.body;
      return {
        ...state,
        dmPage: page,
      };
    }
    case SET_INITIAL_GROUPFEED_CHATROOM: {
      const groupFeedChatrooms = action.body;
      if (state.groupFeedChatrooms.length === 0) {
        return {
          ...state,
          groupFeedChatrooms: groupFeedChatrooms,
        };
      }
      return state;
    }
    case SET_INITIAL_DMFEED_CHATROOM: {
      const {dmFeedChatrooms = {}} = action.body;
      console.log('dmFeedChatroomssdf', dmFeedChatrooms);

      if (state.dmFeedChatrooms.length === 0) {
        return {
          ...state,
          dmFeedChatrooms: dmFeedChatrooms,
        };
      }
      return state;
    }
    case DELETE_GROUPFEED_CHATROOM: {
      const index = action.body;
      console.log('kujyhtgbfvds', index);

      let groupFeedChatrooms = state.groupFeedChatrooms;
      groupFeedChatrooms = [
        ...groupFeedChatrooms.slice(0, index),
        ...groupFeedChatrooms.slice(index + 1),
      ];
      return {
        ...state,
        groupFeedChatrooms: groupFeedChatrooms,
      };
    }
    case DELETE_DMFEED_CHATROOM: {
      const index = action.body;

      let dmFeedChatrooms = state.dmFeedChatrooms;
      dmFeedChatrooms = [
        ...dmFeedChatrooms.slice(0, index),
        ...dmFeedChatrooms.slice(index + 1),
      ];
      return {
        ...state,
        dmFeedChatrooms: dmFeedChatrooms,
      };
    }
    case UPDATE_GROUPFEED_CHATROOM: {
      const modifiedChatroom = action.body.modifiedChatroom;
      const index = action.body.index;
      if (modifiedChatroom?.type !== 10) {
        let groupFeedChatrooms = state.groupFeedChatrooms;
        groupFeedChatrooms[index] = modifiedChatroom;
        return {
          ...state,
          groupFeedChatrooms: groupFeedChatrooms,
        };
      }
      return state;
    }
    case UPDATE_DMFEED_CHATROOM: {
      const modifiedDMChatroom = action.body.modifiedDMChatroom;
      const index = action.body.index;
      console.log('modifiedDMChatroomREducer', modifiedDMChatroom);
      console.log('indexReducer', index);
      if (modifiedDMChatroom?.type === 10) {
        let dmFeedChatrooms = state.dmFeedChatrooms;
        dmFeedChatrooms[index] = modifiedDMChatroom;
        return {
          ...state,
          dmFeedChatrooms: dmFeedChatrooms,
        };
      }

      // if (modifiedDMChatroom?.type === 10) {
      //   let dmFeedChatrooms = state.dmFeedChatrooms;
      //   console.log('dmFeedChatrooms', dmFeedChatrooms);
      //   let currentIndex = 0;
      //   for (let i = 0; i < dmFeedChatrooms.length; i++) {
      //     if (dmFeedChatrooms[i]?.id === modifiedDMChatroom?.id) {
      //       currentIndex = i;
      //       console.log('currentIndex', currentIndex);
      //       break;
      //     }
      //   }

      //   console.log('dmFeedChatroomsOld', dmFeedChatrooms);

      //   const updatedDMChatrooms = removeAndShift(
      //     dmFeedChatrooms,
      //     currentIndex,
      //     modifiedDMChatroom,
      //   );

      //   // console.log('dmFeedChatroomsOld', dmFeedChatrooms);

      //   // dmFeedChatrooms[index] = modifiedDMChatroom;
      //   console.log('dmFeedChatroomsNew', updatedDMChatrooms);

      //   // console.log('oldDMFeedChatrooms', state.dmFeedChatrooms);

      //   // const dmFeedChatrooms = removeAndShift(
      //   //   state.dmFeedChatrooms,
      //   //   index,
      //   //   modifiedDMChatroom,
      //   // );

      //   // console.log('updatedDMFEEdChatrooms', dmFeedChatrooms);

      //   return {
      //     ...state,
      //     dmFeedChatrooms: updatedDMChatrooms,
      //   };
      // }
      return state;
    }
    case INSERT_GROUPFEED_CHATROOM: {
      const insertedChatroom = action.body.insertedChatroom;
      const index = action.body.index;
      if (insertedChatroom?.type !== 10) {
        let currentChatrooms = state.groupFeedChatrooms;
        if (currentChatrooms.length !== 0) {
          currentChatrooms = [
            ...currentChatrooms.slice(0, index),
            insertedChatroom,
            ...currentChatrooms.slice(index),
          ];
        } else {
          currentChatrooms = [...state.groupFeedChatrooms, insertedChatroom];
        }
        return {
          ...state,
          groupFeedChatrooms: currentChatrooms,
        };
      }
      return state;
    }
    case INSERT_DMFEED_CHATROOM: {
      const insertedDMChatroom = action.body.insertedDMChatroom;
      const index = action.body.index;
      console.log('insertedChatroomREducer', insertedDMChatroom);
      console.log('indexinsertedChatroomReducer', index);
      if (insertedDMChatroom?.type === 10) {
        let currentChatrooms = state.dmFeedChatrooms;
        console.log('currentDMCHatroms', currentChatrooms);

        if (currentChatrooms.length !== 0) {
          currentChatrooms = [
            ...currentChatrooms.slice(0, index),
            insertedDMChatroom,
            ...currentChatrooms.slice(index),
          ];
          console.log('modifiedDMCHaroapdkl', currentChatrooms);
        } else {
          currentChatrooms = [...state.dmFeedChatrooms, insertedDMChatroom];
          console.log('modifiedFirealkrfj', currentChatrooms);
        }
        return {
          ...state,
          dmFeedChatrooms: currentChatrooms,
        };
      }
      return state;
    }
    case GET_INVITES_SUCCESS: {
      const {userInvites = []} = action.body;
      return {
        ...state,
        invitedChatrooms: userInvites,
      };
    }
    case ACCEPT_INVITE_SUCCESS: {
      const chatroomID = action.body;
      let filteredInvites = state.invitedChatrooms.filter((val: any) => {
        return val?.chatroom?.id !== chatroomID;
      });
      return {
        ...state,
        invitedChatrooms: filteredInvites,
      };
    }
    case REJECT_INVITE_SUCCESS: {
      const chatroomID = action.body;
      let filteredInvites = state.invitedChatrooms.filter((val: any) => {
        return val?.chatroom?.id !== chatroomID;
      });
      return {
        ...state,
        invitedChatrooms: filteredInvites,
      };
    }
    case UPDATE_INVITES_SUCCESS: {
      const {userInvites = []} = action.body;
      return {
        ...state,
        invitedChatrooms: [...state.invitedChatrooms, ...userInvites],
      };
    }
    case GET_HOMEFEED_CHAT_SUCCESS: {
      const {unseenChannelCount, totalChannelCount} = action.body;
      return {
        ...state,
        totalCount: totalChannelCount,
        unseenCount: unseenChannelCount,
      };
    }
    case UPDATE_HOMEFEED_CHAT_SUCCESS: {
      const {myChatrooms = []} = action.body;
      return {...state, myChatrooms: [...state.myChatrooms, ...myChatrooms]};
    }
    case GET_DMFEED_CHAT_SUCCESS: {
      const {dmChatrooms} = action.body;
      return {
        ...state,
        myDMChatrooms: dmChatrooms,
      };
    }
    case UPDATE_DMFEED_CHAT_SUCCESS: {
      const {dmChatrooms = []} = action.body;
      return {
        ...state,
        myDMChatrooms: [...state.myDMChatrooms, ...dmChatrooms],
      };
    }
    case UPDATE_LAST_CONVERSATION: {
      const {lastConversationAnswer, chatroomType, chatroomID} = action.body;

      let isDM = chatroomType === 10 ? true : false;
      let chatroomList = isDM ? state?.myDMChatrooms : state?.myChatrooms;
      let index = chatroomList.findIndex((element: any) => {
        return element?.chatroom?.id == chatroomID;
      });

      let arr = [...(chatroomList as any)];
      if (index !== undefined || index !== -1) {
        let chatroomObject = arr[index];
        arr[index] = {
          ...chatroomObject,
          lastConversation: {
            ...chatroomObject?.lastConversation,
            answer: lastConversationAnswer,
          },
        };
      }
      return {
        ...state,
        myChatrooms: isDM ? state?.myChatrooms : [...arr],
        myDMChatrooms: isDM ? [...arr] : state?.myDMChatrooms,
      };
    }
    case INIT_API_SUCCESS: {
      const {community = {}} = action.body;
      return {...state, community: community};
    }
    case PROFILE_DATA_SUCCESS: {
      const {member = {}, memberRights = []} = action.body;
      return {...state, user: member, memberRights: memberRights};
    }
    case SHOW_TOAST: {
      const {isToast, msg} = action.body;
      return {...state, isToast: isToast, toastMessage: msg};
    }
    case STATUS_BAR_STYLE: {
      const {color} = action.body;
      return {...state, statusBarStyle: color};
    }
    default:
      return state;
  }
}
