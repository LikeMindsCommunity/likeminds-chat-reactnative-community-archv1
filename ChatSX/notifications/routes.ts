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

  const navigationRoute = route?.match(REGEX_TO_EXTRACT_PATH);
  while ((match = REGEX_TO_EXTRACT_PARAMS.exec(route))) {
    params[match[1]] = match[2];
  }

  if (navigationRoute) {
    switch (navigationRoute[1]) {
      case ROUTE_CHATROOM: {
        const paramsKey = Object.keys(params);
        return {
          route: CHATROOM,
          params: {
            chatroomID: params[paramsKey[0]],
            navigationFromNotification: true,
            navigationRoute: navigationRoute[1],
          },
        };
      }
      case ROUTE_CHATROOM_DETAIL: {
        const paramsKey = Object.keys(params);
        return {
          route: CHATROOM,
          params: {
            chatroomID: params[paramsKey[0]],
            navigationFromNotification: true,
            navigationRoute: navigationRoute[1],
          },
        };
      }
      case ROUTE_POLL_CHATROOM: {
        const paramsKey = Object.keys(params);
        return {
          route: CHATROOM,
          params: {
            chatroomID: params[paramsKey[1]],
            navigationFromNotification: true,
            navigationRoute: navigationRoute[1],
          },
        };
      }
      default:
        return {
          route: HOMEFEED,
          params: {navigationRoute: navigationRoute[1]},
        };
    }
  } else {
    return {
      route: HOMEFEED,
      params: {navigationRoute: navigationRoute[1]},
    };
  }
}

// to get deeplinking routes
export function getLinkingRoute(route: string) {
  let params = {} as RouteParams,
    match;

  const navigationRoute = route?.match(REGEX_TO_EXTRACT_PATH);
  while ((match = REGEX_TO_EXTRACT_PARAMS.exec(route))) {
    params[match[1]] = match[2];
  }

  if (navigationRoute) {
    switch (navigationRoute[1]) {
      case ROUTE_CHATROOM: {
        const paramsKey = Object.keys(params);
        return {
          route: CHATROOM,
          params: {
            chatroomID: params[paramsKey[0]],
            navigationFromNotification: false,
            deepLinking: true,
            navigationRoute: navigationRoute[1],
          },
        };
      }
      default:
        return {route: HOMEFEED, params: {navigationRoute: navigationRoute[1]}};
    }
  } else {
    return {route: HOMEFEED, params: {navigationRoute: navigationRoute[1]}};
  }
}
