import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  Alert,
  Button,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {myClient} from '../../..';
import STYLES from '../../constants/Styles';
import styles from './styles';
import {SHOW_TOAST} from '../../store/types/types';
import {useAppDispatch} from '../../store';
import {Events, Keys} from '../../enums';
import {LMChatAnalytics} from '../../analytics/LMChatAnalytics';
import {getConversationType} from '../../utils/analyticsUtils';
interface Props {
  navigation: any;
  route: any;
}
const ReportScreen = ({navigation, route}: Props) => {
  const [reasons, setReasons] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [otherReason, setOtherReason] = useState('');
  const [selectedId, setSelectedId] = useState(-1);
  const [selectedTagReason, setSelectedTagReason] = useState('');

  const {
    conversationID,
    isDM = false,
    chatroomID,
    selectedMessages,
  } = route.params;

  const dispatch = useAppDispatch();

  const setInitialHeader = () => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerLeft: () => (
        <View style={styles.headingContainer}>
          {/* <TouchableOpacity onPress={navigation.goBack}>
            <Image
              source={require('../../assets/images/back_arrow3x.png')}
              style={styles.backBtn}
            />
          </TouchableOpacity> */}
          <View style={styles.chatRoomInfo}>
            <Text
              style={{
                color: STYLES.$COLORS.RED,
                fontSize: STYLES.$FONT_SIZES.LARGE,
                fontFamily: STYLES.$FONT_TYPES.MEDIUM,
              }}>
              {'Report Message'}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={navigation.goBack}
          // setModalVisible(!modalVisible);
        >
          <Image
            source={require('../../assets/images/close_icon.png')}
            style={styles.threeDots}
          />
        </TouchableOpacity>
      ),
    });
  };

  useLayoutEffect(() => {
    setInitialHeader();
  }, []);

  useEffect(() => {
    const getTags = async () => {
      try {
        const res = await myClient?.getReportTags({
          type: isDM === true ? 1 : 0,
        });
        setReasons(res?.data?.reportTags);
      } catch (error) {
        //    Alert.alert('API failed')
      }
    };
    getTags();
  }, []);

  const reportMessage = async () => {
    try {
      const call = await myClient?.postReport({
        conversationId: Number(conversationID),
        tagId: Number(selectedId),
        reason: otherReason != '' ? otherReason : '',
      });
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: 'Reported succesfully'},
      });
      LMChatAnalytics.track(
        Events.MESSAGE_REPORTED,
        new Map<string, string>([
          [Keys.TYPE, getConversationType(selectedMessages)],
          [Keys.CHATROOM_ID, chatroomID?.toString()],
          [Keys.REASON, otherReason != '' ? otherReason : selectedTagReason],
        ]),
      );
    } catch (error) {
      //  Alert.alert('API failed')
    }
  };
  return (
    <View style={styles.page}>
      <View style={{gap: 15}}>
        <Text style={styles.textHeading}>
          Please specify the problem to continue
        </Text>
        <Text style={styles.text}>
          You would be able to report this message after selecting a problem
        </Text>
      </View>
      <View
        style={{
          // flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 24,
        }}>
        {reasons.map((res: any, index: number) => {
          return (
            <Pressable
              key={res?.id}
              onPress={() => {
                setSelectedIndex(index);
                setSelectedId(res?.id);
                setSelectedTagReason(res?.name);
              }}>
              <View
                style={[
                  styles.reasonsBtn,
                  {
                    backgroundColor:
                      index == selectedIndex ? STYLES.$COLORS.PRIMARY : 'white',
                    borderColor: STYLES.$COLORS.MSG,
                  },
                ]}>
                <Text
                  style={[
                    styles.btnText,
                    {
                      color:
                        selectedIndex == index ? 'white' : STYLES.$COLORS.MSG,
                    },
                  ]}>
                  {res.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {selectedIndex == 5 ? (
        <View
          style={{
            marginTop: 24,
            // flex: 3,
          }}>
          <TextInput
            onChangeText={e => {
              setOtherReason(e);
            }}
            style={{
              margin: 12,
              height: 40,
              borderBottomWidth: 1,
              padding: 10,
              paddingLeft: 0,
              fontSize: STYLES.$FONT_SIZES.MEDIUM,
              fontFamily: STYLES.$FONT_TYPES.LIGHT,
              color: STYLES.$COLORS.SECONDARY,
            }}
            placeholder="Enter the reason for Reporting this conversation"
            value={otherReason}
          />
        </View>
      ) : null}
      <View style={styles.reportBtnParent}>
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => {
            reportMessage();
            navigation.goBack();
          }}>
          <Text style={styles.reportBtnText}>REPORT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReportScreen;
