import Styles from '../../constants/Styles';
import {sortChatrooms} from '../../utils/homeFeedUtils';
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
  switch (action.type) {
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
      const dmFeedChatrooms = action.body;
      if (state.dmFeedChatrooms.length === 0) {
        return {
          ...state,
          dmFeedChatrooms: dmFeedChatrooms,
        };
      }
      return state;
    }
    case UPDATE_GROUPFEED_CHATROOM: {
      const insertedChatroom = action.body;
      if (insertedChatroom.type !== 10) {
        let groupFeedChatrooms = state.groupFeedChatrooms;
        for (let i = 0; i < groupFeedChatrooms.length; i++) {
          if (insertedChatroom.id == groupFeedChatrooms[i].id) {
            groupFeedChatrooms = [
              ...groupFeedChatrooms.slice(0, i),
              ...groupFeedChatrooms.slice(i + 1),
            ];
            groupFeedChatrooms.push(insertedChatroom);
            break;
          }
        }
        const sortedGroupFeedChatrooms = sortChatrooms(groupFeedChatrooms);
        return {
          ...state,
          groupFeedChatrooms: sortedGroupFeedChatrooms,
        };
      }
      return state;
    }
    case UPDATE_DMFEED_CHATROOM: {
      const insertedChatroom = action.body;
      if (insertedChatroom.type === 10) {
        let dmFeedChatrooms = state.dmFeedChatrooms;
        for (let i = 0; i < dmFeedChatrooms.length; i++) {
          if (insertedChatroom.id == dmFeedChatrooms[i].id) {
            dmFeedChatrooms = [
              ...dmFeedChatrooms.slice(0, i),
              ...dmFeedChatrooms.slice(i + 1),
            ];
            dmFeedChatrooms.push(insertedChatroom);
            break;
          }
        }
        const sortedDmFeedChatrooms = sortChatrooms(dmFeedChatrooms);
        return {
          ...state,
          dmFeedChatrooms: sortedDmFeedChatrooms,
        };
      }
      return state;
    }
    case INSERT_GROUPFEED_CHATROOM: {
      const insertedChatroom = action.body;
      if (insertedChatroom.type !== 10) {
        const updatedGroupFeedChatrooms = [
          ...state.groupFeedChatrooms,
          insertedChatroom,
        ];
        const sortedAndUpdatedGroupFeedChatrooms = sortChatrooms(
          updatedGroupFeedChatrooms,
        );
        return {
          ...state,
          groupFeedChatrooms: sortedAndUpdatedGroupFeedChatrooms,
        };
      }
      return state;
    }
    case INSERT_DMFEED_CHATROOM: {
      const insertedChatroom = action.body;
      if (insertedChatroom.type === 10) {
        const updatedDmFeedChatrooms = [
          ...state.dmFeedChatrooms,
          insertedChatroom,
        ];
        const sortedAndUpdatedDmFeedChatrooms = sortChatrooms(
          updatedDmFeedChatrooms,
        );
        return {
          ...state,
          dmFeedChatrooms: sortedAndUpdatedDmFeedChatrooms,
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
