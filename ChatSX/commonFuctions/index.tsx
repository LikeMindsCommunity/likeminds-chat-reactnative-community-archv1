import React, {Alert, Linking, Platform, Text} from 'react-native';
import STYLES from '../constants/Styles';
import {PDF_TEXT, VIDEO_TEXT} from '../constants/Strings';
import {createThumbnail} from 'react-native-create-thumbnail';
import PdfThumbnail from 'react-native-pdf-thumbnail';
import moment from 'moment';
import {Events, Keys} from '../enums';
import {LMChatAnalytics} from '../analytics/LMChatAnalytics';
import {getConversationType} from '../utils/analyticsUtils';

const REGEX_USER_SPLITTING = /(<<.+?\|route:\/\/[^>]+>>)/gu;
export const REGEX_USER_TAGGING =
  /<<(?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+(\?.+)?)>>/g;

export const SHOW_LIST_REGEX = /[?&]show_list=([^&]+)/;

export const EXTRACT_PATH_FROM_ROUTE_QUERY = /\/([^/].*)/;

{
  /* This is a generic arrow function to remove a specific key. 
  The first argument is the name of the key to remove, the second is the object from where you want to remove the key. 
  Note that by restructuring it, we generate the curated result, then return it. */
}
export const removeKey = (key: any, {[key]: _, ...rest}) => rest;

// This function helps us to decode time(created_epoch: 1675421848540) into DATE if more than a day else TIME if less than a day.
export function getFullDate(time: any) {
  if (!!time) {
    let t = new Date(time);
    let today = new Date(Date.now());
    let date = t.getDate();
    let month = t.getMonth() + 1;
    let year = t.getFullYear();

    let todayStr = `${today.getDate()}/${today.getMonth()}/${today.getFullYear()}`;
    let tStr = `${date}/${month}/${year}`;
    if (todayStr === tStr) {
      return `${t.getHours()}:${t.getMinutes()}`;
    } else {
      return tStr;
    }
  } else {
    return;
  }
}

function detectLinks(message: string, isLongPress?: boolean) {
  const regex =
    /((?:https?:\/\/)?(?:www\.)?(?:\w+\.)+\w+(?:\/\S*)?|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/i;

  let parts = message.split(regex);
  let i = 0;
  if (parts?.length > 0) {
    return (
      <Text>
        {parts?.map((val: any, index: any) => (
          <Text key={val + index}>
            {/* key should be unique so we are passing `val(abc) + index(number) = abc2` to make it unique */}
            {regex.test(val) ? (
              <Text
                onPress={async () => {
                  if (!!!isLongPress) {
                    const urlRegex = /(https?:\/\/[^\s]+)/gi;
                    const emailRegex =
                      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
                    let isURL = urlRegex.test(val);
                    let isEmail = emailRegex.test(val);

                    if (isEmail) {
                      await Linking.openURL(`mailto:${val}`);
                    } else if (isURL) {
                      await Linking.openURL(val);
                    } else {
                      await Linking.openURL(`https://${val}`);
                    }
                  }
                }}>
                <Text
                  style={{
                    color: STYLES.$COLORS.LIGHT_BLUE,
                    fontSize: STYLES.$FONT_SIZES.MEDIUM,
                    fontFamily: STYLES.$FONT_TYPES.LIGHT,
                  }}>
                  {val}
                </Text>
              </Text>
            ) : (
              <Text>{val}</Text>
            )}
          </Text>
        ))}
      </Text>
    );
  } else {
    return message;
  }
}

export function getNameInitials(name: string) {
  let initials = '';

  const words = name.split(' ');

  for (let i = 0; i < words?.length && initials?.length < 2; i++) {
    if (words[i]?.length > 0) {
      initials += words[i][0].toUpperCase();
    }
  }

  return initials;
}

// naruto: naruto|route://member_profile/88226?member_id=__id__&community_id=__community__>>
// test string = '<<Sanjay kumar 🤖|route://member/1260>> <<Ishaan Jain|route://member/1003>> Hey google.com';
// This decode function helps us to decode tagged messages like the above test string in to readable format.
// This function has two responses: one for Homefeed screen and other is for chat screen(Pressable ones are for chat screen).
// The REGEX_USER_SPLITTING is used to split the text into different parts based on the regex specified and then using a for loop tags are shown differently along with name and route
export const decode = (
  text: string | undefined,
  enableClick: boolean,
  chatroomName: string,
  communityId: string,
  isLongPress?: boolean,
  memberUuid?: string,
  chatroomWithUserUuid?: string,
  chatroomWithUserMemberId?: string,
) => {
  if (!text) {
    return;
  }
  let arr: any[] = [];
  let parts = text?.split(REGEX_USER_SPLITTING);

  if (!!parts) {
    for (const matchResult of parts) {
      if (!!matchResult.match(REGEX_USER_TAGGING)) {
        let match = REGEX_USER_TAGGING.exec(matchResult);
        if (match !== null) {
          let {name, route} = match?.groups!;

          const startingIndex = route.indexOf('/');
          const taggedUserId = route.substring(startingIndex + 1);

          LMChatAnalytics.track(
            Events.USER_TAGS_SOMEONE,
            new Map<string, string>([
              [Keys.COMMUNITY_ID, communityId?.toString()],
              [Keys.CHATROOM_NAME, chatroomName?.toString()],
              [Keys.TAGGED_USER_ID, taggedUserId?.toString()],
              [Keys.TAGGED_USER_NAME, name?.toString()],
            ]),
          );

          if (memberUuid && chatroomWithUserUuid && chatroomWithUserMemberId) {
            const startingIndex = route.indexOf('/');

            const currentMemberId = route.substring(startingIndex + 1);

            if (currentMemberId == chatroomWithUserMemberId) {
              route = `user_profile/${chatroomWithUserUuid}`;
            } else {
              route = `user_profile/${memberUuid}`;
            }
          }

          arr.push({key: name, route: route});
        }
      } else {
        arr.push({key: matchResult, route: null});
      }
    }

    return enableClick ? (
      <Text>
        {arr.map((val, index) => (
          <Text
            style={{
              color: STYLES.$COLORS.PRIMARY,
              fontFamily: STYLES.$FONT_TYPES.LIGHT,
            }}
            key={val.key + index}>
            {/* key should be unique so we are passing `val(abc) + index(number) = abc2` to make it unique */}

            {!!val.route ? (
              <Text
                onPress={() => {
                  if (!!!isLongPress) {
                    Alert.alert(`navigate to the route ${val?.route}`);
                  }
                }}
                style={{
                  color: STYLES.$COLORS.LIGHT_BLUE,
                  fontSize: STYLES.$FONT_SIZES.MEDIUM,
                  fontFamily: STYLES.$FONT_TYPES.LIGHT,
                }}>
                {val.key}
              </Text>
            ) : (
              detectLinks(val.key, isLongPress)
            )}
          </Text>
        ))}
      </Text>
    ) : (
      <Text>
        {arr.map((val, index) => (
          <Text
            style={{
              color: STYLES.$COLORS.PRIMARY,
              fontFamily: STYLES.$FONT_TYPES.LIGHT,
            }}
            key={val.key + index}>
            {!!val.route ? (
              <Text
                style={{
                  color: STYLES.$COLORS.PRIMARY,
                  fontFamily: STYLES.$FONT_TYPES.BOLD,
                }}>
                {val.key}
              </Text>
            ) : (
              val.key
            )}
          </Text>
        ))}
      </Text>
    );
  } else {
    return text;
  }
};

export const decodeForNotifications = (text: string | undefined) => {
  if (!text) {
    return;
  }
  let arr: any[] = [];
  let parts = text?.split(/(?:<<)?([\w\s🤖@]+\|route:\/\/\S+>>)/g);
  const TEMP_REGEX_USER_TAGGING =
    /(?:<<)?((?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+(\?.+)?)>>)/g;

  if (!!parts) {
    for (const matchResult of parts) {
      if (!!matchResult.match(TEMP_REGEX_USER_TAGGING)) {
        let match = TEMP_REGEX_USER_TAGGING.exec(matchResult);
        if (match !== null) {
          const {name, route} = match?.groups!;
          arr.push({key: name, route: route});
        }
      } else {
        arr.push({key: matchResult, route: null});
      }
    }
    let decodedText = '';
    for (let i = 0; i < arr.length; i++) {
      decodedText = decodedText + arr[i].key;
    }
    return decodedText;
  } else {
    return text;
  }
};

// This functions formatted the copied messages.
export function decodeStr(text: string | undefined) {
  if (!text) {
    return;
  }
  let arr: any[] = [];
  let parts = text.split(REGEX_USER_SPLITTING);

  if (!!parts) {
    for (const matchResult of parts) {
      let keyValue = matchResult.match(REGEX_USER_TAGGING);
      let memberName;
      let tag;
      if (!!keyValue) {
        memberName = keyValue[1];
        tag = keyValue[2];
        arr.push({key: memberName, route: true});
      } else if (!!matchResult) {
        arr.push({key: matchResult, route: null});
      }
    }
    let str: string = '';
    arr.forEach(val => {
      str = str + val.key;
    });
    return str;
  } else {
    return text;
  }
}

// this function return copied messages in formatted form using decodeStr
export function copySelectedMessages(
  selectedMessages: any,
  chatroomID: string,
) {
  LMChatAnalytics.track(
    Events.MESSAGE_COPIED,
    new Map<string, string>([
      [Keys.TYPE, getConversationType(selectedMessages[0])],
      [Keys.CHATROOM_ID, chatroomID],
    ]),
  );
  if (selectedMessages?.length === 1 && !!!selectedMessages[0]?.deletedBy) {
    if (!!selectedMessages[0]?.answer) {
      return decodeStr(selectedMessages[0]?.answer);
    } else {
      return '';
    }
  } else {
    const copiedMessages = selectedMessages
      .map((message: any) => {
        if (!!message?.answer && !!!message?.deletedBy) {
          const timestamp = `[${message?.date}, ${message?.createdAt}]`;
          const sender = message?.member?.name;
          const text = decodeStr(message?.answer);
          return `${timestamp} ${sender}: ${text}`;
        } else {
          return '';
        }
      })
      .join('\n');
    return copiedMessages;
  }
}

// this function formats the recordedTime(future) in days hours and minutes
export function formatTime(recordedTime: number): string {
  const date: Date = new Date(recordedTime);
  const now: Date = new Date();

  const diff: number = date.getTime() - now.getTime();
  const seconds: number = Math.floor(diff / 1000);
  const minutes: number = Math.floor(seconds / 60);
  const hours: number = Math.floor(minutes / 60);
  const days: number = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else {
    return `${minutes}m`;
  }
}

export const fetchResourceFromURI = async (uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

interface VideoThumbnail {
  selectedImages: any;
  selectedFilesToUpload?: any;
  selectedFilesToUploadThumbnails?: any;
  initial: boolean; // true when selecting Videos for first time, else false.
}

// function to get thumbnails from videos
export const getVideoThumbnail = async ({
  selectedImages,
  selectedFilesToUpload,
  selectedFilesToUploadThumbnails,
  initial,
}: VideoThumbnail) => {
  let arr: any = [];
  let dummyArrSelectedFiles: any = selectedImages;
  for (let i = 0; i < selectedImages?.length; i++) {
    let item = selectedImages[i];
    if (item?.type?.split('/')[0] === VIDEO_TEXT) {
      await createThumbnail({
        url: item.uri,
        timeStamp: 10000,
      })
        .then(response => {
          arr = [...arr, {uri: response.path}];
          dummyArrSelectedFiles[i] = {
            ...dummyArrSelectedFiles[i],
            thumbnailUrl: response.path,
          };
        })
        .catch(err => {});
    } else {
      arr = [...arr, {uri: item.uri}];
    }
  }
  return {
    selectedFilesToUploadThumbnails: initial
      ? arr
      : [...selectedFilesToUploadThumbnails, ...arr],
    selectedFilesToUpload: initial
      ? dummyArrSelectedFiles
      : [...selectedFilesToUpload, ...dummyArrSelectedFiles],
  };
};

// function to get thumbnails of all pdf
export const getAllPdfThumbnail = async (selectedImages: any) => {
  let arr: any = [];
  for (let i = 0; i < selectedImages?.length; i++) {
    let item = selectedImages[i];
    const filePath = item.uri;
    const page = 0;
    if (item?.type?.split('/')[1] === PDF_TEXT) {
      const res = await PdfThumbnail.generate(filePath, page);
      if (!!res) {
        arr = [...arr, {uri: res?.uri}];
      }
    } else {
      arr = [...arr, {uri: item.uri}];
    }
  }
  return arr;
};

// function to get thumbnails of pdf
export const getPdfThumbnail = async (selectedFile: any) => {
  let arr: any = [];
  const filePath = selectedFile.uri;
  const page = 0;
  if (selectedFile?.type?.split('/')[1] === PDF_TEXT) {
    const res = await PdfThumbnail.generate(filePath, page);
    if (!!res) {
      arr = [...arr, {uri: res?.uri}];
    }
  } else {
    arr = [...arr, {uri: selectedFile.uri}];
  }
  return arr;
};

//this function detect "@" mentions/tags while typing.
export function detectMentions(input: string) {
  const mentionRegex = /(?:^|\s)@(\w+)/g;
  const matches = [];
  let match;

  while ((match = mentionRegex.exec(input)) !== null) {
    const startIndex = match.index;
    const endIndex = mentionRegex.lastIndex;
    const nextChar = input.charAt(endIndex);

    if (nextChar !== '@') {
      matches.push(match[1]);
    }
  }

  const myArray = input.split(' ');
  const doesExists = myArray.includes('@');

  {
    /* It basically checks that for the below four conditions:
   1. if '@' is at end preceded by a whitespace
   2. if input only contains '@'
   3. if '@' occurs at new line
   4. doesExists checks whether '@' has been typed between two strings
   If any of the above condition is true, it pushes it in the matches list which indicates that member list has to be shown 
  */
  }
  if (
    input.endsWith(' @') ||
    input === '@' ||
    input.endsWith('\n@') ||
    (doesExists && !input.endsWith(' '))
  ) {
    matches.push('');
  }

  return matches;
}

// this function replaces the last @mention from the textInput if we have clicked on a tag from suggestion
export function replaceLastMention(
  input: string,
  taggerUserName: string,
  mentionUsername: string,
  UUID: string,
) {
  let mentionRegex: RegExp;

  if (taggerUserName === '') {
    mentionRegex = /(?<=^|\s)@(?=\s|$)/g;
  } else {
    mentionRegex = new RegExp(
      `@${taggerUserName}\\b(?!.*@${taggerUserName}\\b)`,
      'gi',
    );
  }
  const replacement = `@[${mentionUsername}](${UUID}) `;
  const replacedString = input?.replace(mentionRegex, replacement);
  return replacedString;
}

export const formatValue = (value: any) => {
  // Check if the value matches the required pattern
  const regex = /<<(\w+)\|.*>>/;
  const match = regex.exec(value);

  if (match && match[1]) {
    const username = match[1];
    return `@${username}`;
  }

  return '';
};

// this function is used to extract path from from route query, i.e routeQuery: `user_profile/skjdnc-lskdnjcs-lkdnsm`, path: `skjdnc-lskdnjcs-lkdnsm`
export function extractPathfromRouteQuery(inputString: string): string | null {
  const match = inputString.match(EXTRACT_PATH_FROM_ROUTE_QUERY);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

// this function formats the date in "DD/MM/YYYY hh:mm" format
export const formatDate = (date: any, time: any) => {
  let formattedTime = moment(date).format('DD/MM/YYYY hh:mm');
  return formattedTime;
};

// this function converts seconds count to mm:ss time format
export function convertSecondsToTime(seconds: number) {
  // Ensure that seconds is a non-negative number
  if (isNaN(seconds) || seconds < 0) {
    return 'Invalid input';
  }

  let minutes = String(Math.floor(seconds / 60));
  let remainingSeconds = String(seconds % 60);

  // Add leading zeros if necessary
  minutes = minutes.padStart(2, '0');
  remainingSeconds = remainingSeconds.padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

// to check if device version greater than or equal to 13 or not
export const atLeastAndroid13 = (): boolean => {
  return Platform.OS === 'android' && Platform.Version >= 33;
};
