import {View, Text, Pressable} from 'react-native';
import STYLES from '../constants/Styles';

const REGEX_USER_SPLITTING = /(<<[\w\s🤖]+\|route:\/\/member\/\d+>>)/g;
const REGEX_USER_TAGGING = /<<([\w\s🤖]+)\|route:\/\/member\/(\d+)>>/;

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

export function decode(text: string | undefined, enableClick: boolean) {
  if (!text) {
    return;
  }
  // test string = '<<Sanjay kumar 🤖|route://member/1260>> <<Ishaan Jain|route://member/1003>> Hey google.com';
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
        arr.push({key: memberName, route: tag});
      } else if (!!matchResult) {
        arr.push({key: matchResult, route: null});
      }
    }
    if (enableClick) {
      return (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            // width: STYLES.$TEXTVIEW_WIDTH.REGULAR,
            overflow: 'hidden',
          }}>
          {arr.map((val, index) => (
            <View key={index + val}>
              {!!val.route ? (
                <Pressable>
                  <Text
                    style={{
                      color: STYLES.$COLORS.MSG,
                      fontSize: STYLES.$FONT_SIZES.MEDIUM,
                      fontFamily: STYLES.$FONT_TYPES.BOLD,
                    }}>
                    {val.key}
                  </Text>
                </Pressable>
              ) : (
                <Text
                  style={{
                    color: STYLES.$COLORS.MSG,
                    fontSize: STYLES.$FONT_SIZES.MEDIUM,
                    fontFamily: STYLES.$FONT_TYPES.LIGHT,
                  }}>
                  {val.key}
                </Text>
              )}
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            width: 240,
            overflow:'hidden',
          }}>
          {arr.map((val, index) => (
            <Text
              style={{
                minHeight: 15,
              }}
              numberOfLines={1}
              key={val + index}>
              {!!val.route ? (
                <Text
                  style={{
                    color: STYLES.$COLORS.MSG,
                    fontSize: STYLES.$FONT_SIZES.MEDIUM,
                    fontFamily: STYLES.$FONT_TYPES.BOLD,
                  }}>
                  {val.key}
                </Text>
              ) : (
                <Text
                  style={{
                    color: STYLES.$COLORS.MSG,
                    fontSize: STYLES.$FONT_SIZES.MEDIUM,
                    fontFamily: STYLES.$FONT_TYPES.LIGHT,
                  }}>
                  {val.key}
                </Text>
              )}
            </Text>
          ))}
        </View>
      );
    }
  } else {
    return text;
  }
}
