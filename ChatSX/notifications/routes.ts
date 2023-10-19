import {
  REGEX_TO_EXTRACT_PARAMS,
  REGEX_TO_EXTRACT_PATH,
} from '../constants/Regex';
import {CHATROOM, HOMEFEED} from '../constants/Screens';
import {
  ROUTE_CHATROOM,
  ROUTE_CHATROOM_DETAIL,
  ROUTE_POLL_CHATROOM,
} from './constants';
import {RouteParams} from './models';

// to get notification routes
export function getRoute(route: any) {
  let params = {} as RouteParams,
    match;

  let navigationRoute = route?.match(REGEX_TO_EXTRACT_PATH);
  while ((match = REGEX_TO_EXTRACT_PARAMS.exec(route))) {
    params[match[1]] = match[2];
  }

  if (navigationRoute) {
    switch (navigationRoute[1]) {
      case ROUTE_CHATROOM: {
        let paramsKey = Object.keys(params);
        return {
          route: CHATROOM,
          params: {
            chatroomID: params[paramsKey[0]],
            navigationFromNotification: true,
          },
        };
      }
      case ROUTE_CHATROOM_DETAIL: {
        let paramsKey = Object.keys(params);
        return {
          route: CHATROOM,
          params: {
            chatroomID: params[paramsKey[0]],
            navigationFromNotification: true,
          },
        };
      }
      case ROUTE_POLL_CHATROOM: {
        let paramsKey = Object.keys(params);
        return {
          route: CHATROOM,
          params: {
            chatroomID: params[paramsKey[1]],
            navigationFromNotification: true,
          },
        };
      }
      default:
        return {route: HOMEFEED, params: {}};
    }
  } else {
    return {route: HOMEFEED, params: {}};
  }
}

// to get deeplinking routes
export function getLinkingRoute(route: string) {
  let params = {} as RouteParams,
    match;

  let navigationRoute = route?.match(REGEX_TO_EXTRACT_PATH);
  while ((match = REGEX_TO_EXTRACT_PARAMS.exec(route))) {
    params[match[1]] = match[2];
  }

  if (navigationRoute) {
    switch (navigationRoute[1]) {
      case ROUTE_CHATROOM: {
        let paramsKey = Object.keys(params);
        return {
          route: CHATROOM,
          params: {
            chatroomID: params[paramsKey[0]],
            navigationFromNotification: false,
            deepLinking: true,
          },
        };
      }
      default:
        return {route: HOMEFEED, params: {}};
    }
  } else {
    return {route: HOMEFEED, params: {}};
  }
}
