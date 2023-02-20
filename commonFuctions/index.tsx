import {View, Text, Pressable, TouchableOpacity, Platform} from 'react-native';
import STYLES from '../constants/Styles';

// const REGEX_USER_SPLITTING =
//   /<<(?<name>[\w\s🤖]+)\|route:\/\/member_profile\/\d+\?member_id=(?<id>\d+)&community_id=(?<community>[\w\d_]+)>>/g;
// const REGEX_USER_TAGGING =
//   /<<(?<name>[\w\s🤖]+)\|route:\/\/member_profile\/\d+\?member_id=(?<id>\d+)&community_id=(?<community>[\w\d_]+)>>/;

// const REGEX_USER_SPLITTING = /(<<[\w\s🤖]+\|route:\/\/member\/\d+>>)/g;
// const REGEX_USER_TAGGING = /<<([\w\s🤖]+)\|route:\/\/member\/(\d+)>>/;

const REGEX_USER_SPLITTING = /(<<[\w\s🤖@]+\|route:\/\/\S+>>)/g;
const REGEX_USER_TAGGING = /<<([\w\s🤖@]+)\|route:\/\/\S+>>/;

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

// test string = '<<Sanjay kumar 🤖|route://member/1260>> <<Ishaan Jain|route://member/1003>> Hey google.com';

// This decode function helps us to decode tagged messages like the above test string in to readable format.
// This function has two responses: one for Homefeed screen and other is for chat screen(Pressable ones are for chat screen).
export function decode(text: string | undefined, enableClick: boolean) {
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
    if (enableClick) {
      return (
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
                <TouchableOpacity>
                  <Text
                    style={{
                      color: STYLES.$COLORS.LIGHT_BLUE,
                      fontSize: STYLES.$FONT_SIZES.MEDIUM,
                      fontFamily: STYLES.$FONT_TYPES.LIGHT,
                      marginBottom: -3,
                    }}>
                    {val.key}
                  </Text>
                </TouchableOpacity>
              ) : (
                val.key
              )}
            </Text>
          ))}
        </Text>
      );
    } else {
      return (
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
                    color: STYLES.$COLORS.MSG,
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
    }
  } else {
    return text;
  }
}
