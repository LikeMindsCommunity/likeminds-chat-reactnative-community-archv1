import Styles from '../../constants/Styles';
import {
  ACCEPT_INVITE_SUCCESS,
  GET_DMFEED_CHAT_SUCCESS,
  GET_HOMEFEED_CHAT_SUCCESS,
  GET_INVITES_SUCCESS,
  INIT_API_SUCCESS,
  PROFILE_DATA_SUCCESS,
  REJECT_INVITE_SUCCESS,
  SET_DM_PAGE,
  SET_PAGE,
  SHOW_TOAST,
  STATUS_BAR_STYLE,
  UPDATE_DMFEED_CHAT_SUCCESS,
  UPDATE_HOMEFEED_CHAT_SUCCESS,
  UPDATE_INVITES_SUCCESS,
  UPDATE_LAST_CONVERSATION,
  SET_INITIAL_GROUPFEED_CHATROOM,
  INSERT_GROUPFEED_CHATROOM,
  INSERT_DMFEED_CHATROOM,
  UPDATE_GROUPFEED_CHATROOM,
  UPDATE_DMFEED_CHATROOM,
  SET_INITIAL_DMFEED_CHATROOM,
  DELETE_GROUPFEED_CHATROOM,
  DELETE_DMFEED_CHATROOM,
  STORE_MY_CLIENT,
} from '../types/types';
import {removeDuplicateObjects} from '../../utils/homeFeedUtils';
import {ChatroomType} from '../../enums';
import {LMChatClient} from '@likeminds.community/chat-rn';

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
  myClient: {} as LMChatClient,
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
      const {groupFeedChatrooms = {}} = action.body;
      return {
        ...state,
        groupFeedChatrooms: groupFeedChatrooms,
      };
    }
    case SET_INITIAL_DMFEED_CHATROOM: {
      const {dmFeedChatrooms = {}} = action.body;
      return {
        ...state,
        dmFeedChatrooms: dmFeedChatrooms,
      };
    }
    case DELETE_GROUPFEED_CHATROOM: {
      const index = action.body;
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
        const updatedGroupFeedChatrooms =
          removeDuplicateObjects(groupFeedChatrooms);
        return {
          ...state,
          groupFeedChatrooms: updatedGroupFeedChatrooms,
        };
      }
      return state;
    }
    case UPDATE_DMFEED_CHATROOM: {
      const modifiedDMChatroom = action.body.modifiedDMChatroom;
      const index = action.body.index;
      if (modifiedDMChatroom?.type === 10) {
        let dmFeedChatrooms = state.dmFeedChatrooms;
        dmFeedChatrooms[index] = modifiedDMChatroom;
        const updatedDmFeedChatrooms = removeDuplicateObjects(dmFeedChatrooms);
        return {
          ...state,
          dmFeedChatrooms: updatedDmFeedChatrooms,
        };
      }
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
        const updatedGroupFeedChatrooms =
          removeDuplicateObjects(currentChatrooms);
        return {
          ...state,
          groupFeedChatrooms: updatedGroupFeedChatrooms,
        };
      }
      return state;
    }
    case INSERT_DMFEED_CHATROOM: {
      const insertedDMChatroom = action.body.insertedDMChatroom;
      const index = action.body.index;
      if (insertedDMChatroom?.type === 10) {
        let currentChatrooms = state.dmFeedChatrooms;
        if (currentChatrooms.length !== 0) {
          currentChatrooms = [
            ...currentChatrooms.slice(0, index),
            insertedDMChatroom,
            ...currentChatrooms.slice(index),
          ];
        } else {
          currentChatrooms = [...state.dmFeedChatrooms, insertedDMChatroom];
        }
        const updatedDmFeedChatrooms = removeDuplicateObjects(currentChatrooms);
        return {
          ...state,
          dmFeedChatrooms: updatedDmFeedChatrooms,
        };
      }
      return state;
    }
    case GET_INVITES_SUCCESS: {
      const {userInvites = []} = action.body;
      let updatedUserInvites = [];
      for (let i = 0; i < userInvites.length; i++) {
        let newObject = {
          ...userInvites[i],
          ...userInvites[i]?.chatroom,
        };
        updatedUserInvites.push(newObject);
      }
      return {
        ...state,
        invitedChatrooms: updatedUserInvites,
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

      let isDM = chatroomType === ChatroomType.DMCHATROOM ? true : false;
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
    case STORE_MY_CLIENT: {
      const {myClient = {}} = action.body;
      return {...state, myClient: myClient};
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
