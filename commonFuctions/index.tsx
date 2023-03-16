import {Alert, Linking, Text} from 'react-native';
import 'url-search-params-polyfill';
import STYLES from '../constants/Styles';
import {useAppSelector} from '../store';

// const REGEX_USER_SPLITTING = /(<<[\w\s🤖]+\|route:\/\/member\/\d+>>)/g;
// const REGEX_USER_TAGGING = /<<([\w\s🤖]+)\|route:\/\/member\/(\d+)>>/;

// const REGEX_USER_SPLITTING = /(<<[\w\s🤖@]+\|route:\/\/\S+>>)/g;
// const REGEX_USER_TAGGING =
//   /<<(?<name>[\w\s🤖@]+)\|route:\/\/(?:(?:member|member_profile)\/)?(?<route>\d+|everyone|participants)>?>?/;

const REGEX_USER_SPLITTING = /(<<[\w\s🤖@]+\|route:\/\/\S+>>)/g;
const REGEX_USER_TAGGING =
  /<<(?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+(\?.+)?)>>/g;

// const REGEX_USER_SPLITTING =
//   /<<(?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+)(?<query>\?.+)?>?>/;
// const REGEX_USER_TAGGING =
//   /<<(?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+)(?<query>\?.+)?>?>/;

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

function detectLinks(message: string) {
  const {isLongPress} = useAppSelector(state => state.chatroom);
  const regex = /((?:https?:\/\/)?(?:www\.)?(?:\w+\.)+\w+(?:\/\S*)?)/i;
  let parts = message.split(regex);
  let i = 0;
  if (parts?.length > 0) {
    return (
      <Text>
        {parts?.map((val: any, index: any) => (
          <Text>
            {regex.test(val) ? (
              <Text
                onPress={async () => {
                  if (!isLongPress) {
                    let urlRegex = /(https?:\/\/[^\s]+)/gi;
                    let isMatched = urlRegex.test(val);

                    if (isMatched) {
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
// test string = '<<Sanjay kumar 🤖|route://member/1260>> <<Ishaan Jain|route://member/1003>> Hey google.com';

// This decode function helps us to decode tagged messages like the above test string in to readable format.
// This function has two responses: one for Homefeed screen and other is for chat screen(Pressable ones are for chat screen).
export const decode = (text: string | undefined, enableClick: boolean) => {
  if (!text) {
    return;
  }
  let arr: any[] = [];
  let parts = text?.split(REGEX_USER_SPLITTING);
  const {isLongPress} = useAppSelector(state => state.chatroom);
  // console.log('parts', parts);

  if (!!parts) {
    for (const matchResult of parts) {
      // let memberName;
      // let tag;
      if (!!matchResult.match(REGEX_USER_TAGGING)) {
        let match = REGEX_USER_TAGGING.exec(matchResult);
        if (match !== null) {
          const {name, route} = match?.groups!;
          const searchParams = new URLSearchParams(route);
          // for (var item of searchParams) {
          //   console.log('key: ' + item[0] + ', ' + 'value: ' + item[1]);
          // }
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
              // fontSize: STYLES.$FONT_SIZES.MEDIUM,
              fontFamily: STYLES.$FONT_TYPES.LIGHT,
            }}
            key={index + val}>
            {!!val.route ? (
              <Text
                onPress={() => {
                  if (!isLongPress) {
                    Alert.alert(`navigate to the route ${val?.route}`);
                  }
                }}
                style={{
                  color: STYLES.$COLORS.LIGHT_BLUE,
                  fontSize: STYLES.$FONT_SIZES.MEDIUM,
                  fontFamily: STYLES.$FONT_TYPES.LIGHT,
                  // marginBottom: -3,
                }}>
                {val.key}
              </Text>
            ) : (
              detectLinks(val.key)
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
              // fontSize: STYLES.$FONT_SIZES.MEDIUM,
              fontFamily: STYLES.$FONT_TYPES.LIGHT,
            }}
            key={index + val}>
            {!!val.route ? (
              <Text
                style={{
                  color: STYLES.$COLORS.PRIMARY,
                  // fontSize: STYLES.$FONT_SIZES.MEDIUM,
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

export function copySelectedMessages(selectedMessages: any) {
  // const selectedMessages = messages.filter((message:any) => message.isSelected());
  if (selectedMessages?.length === 1 && !!!selectedMessages[0]?.deleted_by) {
    if (!!selectedMessages[0]?.answer) {
      return decodeStr(selectedMessages[0]?.answer);
    } else {
      return '';
    }
  } else {
    const copiedMessages = selectedMessages
      .map((message: any) => {
        if (!!message?.answer && !!!message?.deleted_by) {
          const timestamp = `[${message?.date}, ${message?.created_at}]`;
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
