import {myClient} from '../../..';
import {PATH_REGEX, QUERY_REGEX} from '../../constants/Regex';
import {getLinkingRoute} from '../../notifications/routes';
import * as RootNavigation from '../../RootNavigation';
import {isValidURI} from '../../shareUtils';
import {DeepLinkRequest, DeepLinkResponse} from './models';
import {CHATROOM} from '../../constants/Screens';

// this function is to parse deep link url
export async function parseDeepLink(
  request: DeepLinkRequest,
  responseCallback?: (response: DeepLinkResponse) => void,
) {
  const uri = request.uri;

  if (isValidURI(uri)) {
    const matches = uri.match(PATH_REGEX);

    const path = matches ? matches[1] : null;

    if (path === '/chatroom' || path === 'chatroom') {
      const regexToExtractParams: RegExp = QUERY_REGEX;
      const params: Record<string, string> = {};
      let match: RegExpExecArray | null;

      // this while loop is to find all the query params in the given link, all the matched queries will be stores in params
      while ((match = regexToExtractParams.exec(uri))) {
        params[match[1]] = match[2];
      }

      const chatroomId = params?.chatroom_id;

      if (chatroomId) {
        const internalRoute = `route://collabcard?collabcard_id=${chatroomId}`;

        // initiate API call
        const initiateUserRequest = {
          userName: request?.userName,
          uuid: request?.uuid,
          isGuest: false,
        };
        const initiateUserResponse = await myClient?.initiateUser(
          initiateUserRequest,
        );

        if (initiateUserResponse?.success) {
          // navigation flow

          const routes = getLinkingRoute(internalRoute);
          const recentRoutes = RootNavigation.getRecentRoutes();
          const currentRoute = recentRoutes?.routes[recentRoutes?.index]?.name;

          if (currentRoute === CHATROOM) {
            // navigation when inside chatroom screen
            RootNavigation.pop();
            RootNavigation.push(routes.route, routes.params);
          } else {
            // navigation when outside chatroom screen
            RootNavigation.navigate(routes.route, routes.params);
          }

          responseCallback?.({success: true});
          return;
        } else {
          responseCallback?.({
            success: false,
            errorMessage: 'URI parsing failed. Please try after some time',
          });
          return;
        }
      } else {
        responseCallback?.({
          success: false,
          errorMessage: 'URI not supported',
        });
        return;
      }
    } else {
      responseCallback?.({
        success: false,
        errorMessage: 'URI not supported',
      });
      return;
    }
  } else {
    responseCallback?.({success: false, errorMessage: 'URI not supported'});
    return;
  }
}
