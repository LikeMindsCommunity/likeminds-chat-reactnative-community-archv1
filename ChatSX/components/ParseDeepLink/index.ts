import {myClient} from '../../..';
import {PATH_REGEX, QUERY_REGEX} from '../../constants/Regex';
import {getRoute} from '../../notifications/routes';
import * as RootNavigation from '../../../RootNavigation';
import { DeepLinkRequest, DeepLinkResponse } from '../../Models/ParseDeepLink';
import { isValidURI } from '../../shareUtils';

// this function is to parse deep link url
export async function parseDeepLink(
  request: DeepLinkRequest,
  responseCallback?: (response: DeepLinkResponse) => void,
) {
  const uri = request.uri;

  if (isValidURI(uri)) {
    const matches = uri.match(PATH_REGEX);

    const path = matches ? matches[1] : null;

    if (path === '/chatroom') {
      let regexToExtractParams: RegExp = QUERY_REGEX;
      let params: Record<string, string> = {};
      let match: RegExpExecArray | null;

      // this while loop is to find all the query params in the given link, all the matched queries will be stores in params
      while ((match = regexToExtractParams.exec(uri))) {
        params[match[1]] = match[2];
      }

      let chatroomId = params?.chatroom_id;

      if (chatroomId) {
        const internalRoute = `route://collabcard?collabcard_id=${chatroomId}`;

        // initiate API call
        let initiateUserRequest = {
          userName: request?.userName,
          uuid: request?.uuid,
          isGuest: false,
        };
        const initiateUserResponse = await myClient?.initiateUser(
          initiateUserRequest,
        );

        if (initiateUserResponse?.success) {
          // nvaigation flow
          let routes = getRoute(internalRoute);
          RootNavigation.navigate(routes.route, routes.params);
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
