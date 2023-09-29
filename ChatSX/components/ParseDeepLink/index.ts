import {myClient} from '../../..';
import {initAPI} from '../../store/actions/homefeed';

interface DeepLinkRequest {
  uri: string;
  userName: string;
  uuid: string;
  isGuest: boolean;
}

interface DeepLinkResponse {
  success: boolean;
  errorMessage?: string;
}

// this function is to check URI is valid or not
function isValidURI(uri: string): boolean {
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  return regex.test(uri);
}

// this function is to parse deep link url
async function parseDeepLink(
  request: DeepLinkRequest,
  responseCallback?: (response: DeepLinkResponse) => void,
) {
  const uri = request.uri;

  if (isValidURI(uri)) {
    const pathSegments = uri.split('/').filter(Boolean);
    if (pathSegments.length >= 1 && pathSegments[0] === 'chatroom') {
      const chatroomId = new URLSearchParams(uri.split('?')[1] || '').get(
        'chatroom_id',
      );

      if (chatroomId) {
        const internalRoute = `route://collabcard?collabcard_id=${chatroomId}`;

        let initiateUserRequest = {
          userName: request?.userName,
          uuid: request?.uuid,
          isGuest: false,
        };
        const success = await myClient.initiateUser(initiateUserRequest);

        if (success) {
          // TODO -- Redirect to internalRoute
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

// Example usage
const exampleRequest: DeepLinkRequest = {
  uri: 'https://domain/chatroom?chatroom_id=123',
  userName: 'John Doe',
  uuid: '123456',
  isGuest: false,
};

parseDeepLink(exampleRequest, response => {
  console.log(response);
});
