import {ROUTE_CHATROOM} from './constants';

export function getRoute(route: any) {
  let regexToExtractHost = /route:\/\/(.*?)\?/;
  let regexToExtractParams = /[?&]([^=#]+)=([^&#]*)/g,
    params = {} as any,
    match;

  let navigationRoute = route?.match(regexToExtractHost);
  while ((match = regexToExtractParams.exec(route))) {
    params[match[1]] = match[2];
  }
  switch (navigationRoute[1]) {
    case ROUTE_CHATROOM:
      let paramsKey = Object.keys(params);
      return {route: 'ChatRoom', params: {chatroomID: params[paramsKey[0]]}};

    default:
      return {route: 'HomeFeed', params: {}};
  }
}
