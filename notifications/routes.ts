import {ROUTE_CHATROOM} from './constants';

export function getRoute(route: any) {
  // const searchURL = new URL(route);
  let regexToExtractHost = /route:\/\/(.*?)\?/;
  let regexToExtractParams = /[?&]([^=#]+)=([^&#]*)/g,
    params = {} as any,
    match;
  // console.log('searchURL =-', searchURL, searchURL.host, searchURL.query);

  let navigationRoute = route?.match(regexToExtractHost);
  // console.log('regexToExtractHost', val, route);
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
