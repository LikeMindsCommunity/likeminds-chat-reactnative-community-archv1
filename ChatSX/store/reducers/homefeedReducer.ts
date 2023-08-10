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
    case GET_INVITES_SUCCESS: {
      const {userInvites = []} = action.body;
      // console.log('userInvi', userInvites);
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
      const {myChatrooms, unseenChatroomCount, totalChatroomCount} =
        action.body;
      // console.log('myChatrooms', myChatrooms);
      // console.log('unseenChatroomCount', unseenChatroomCount);
      // console.log('totalChatroomCount', totalChatroomCount);
      return {
        ...state,
        myChatrooms: myChatrooms,
        totalCount: totalChatroomCount,
        unseenCount: unseenChatroomCount,
      };
    }
    case UPDATE_HOMEFEED_CHAT_SUCCESS: {
      const {myChatrooms = []} = action.body;
      // console.log('myChatroomsUpdateHomeFeed', myChatrooms);
      return {...state, myChatrooms: [...state.myChatrooms, ...myChatrooms]};
    }
    case GET_DMFEED_CHAT_SUCCESS: {
      const {dmChatrooms} = action.body;
      // console.log('dmChatrooms', dmChatrooms);
      return {
        ...state,
        myDMChatrooms: dmChatrooms,
      };
    }
    case UPDATE_DMFEED_CHAT_SUCCESS: {
      const {dmChatrooms = []} = action.body;
      // console.log('dmChatroomsHai', dmChatrooms);
      return {
        ...state,
        myDMChatrooms: [...state.myDMChatrooms, ...dmChatrooms],
      };
    }
    case UPDATE_LAST_CONVERSATION: {
      const {lastConversationAnswer, chatroomType, chatroomID} = action.body;

      // console.log('lastConversationAnswerHai', lastConversationAnswer);

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
      // console.log('actionHai', action.body);
      const {community = {}} = action.body;
      // console.log('communityNew', community);
      return {...state, community: community};
    }
    case PROFILE_DATA_SUCCESS: {
      // console.log('actionGetMember', action.body);
      const {member = {}, memberRights = []} = action.body;
      // console.log('memberNew', member);
      // console.log('memberRightsNew', memberRights);
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
