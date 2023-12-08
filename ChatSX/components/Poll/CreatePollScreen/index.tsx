import {View, Text, TouchableOpacity, Platform} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useAppDispatch} from '../../../store';
import {styles} from '../styles';
import uuid from 'react-native-uuid';
import moment from 'moment';
import {
  DATE_TEXT,
  EMPTY_OPTIONS_WARNING,
  EXPIRY_TIME_WARNING,
  POLLS_OPTIONS_WARNING,
  QUESTION_WARNING,
  TIME_TEXT,
} from '../../../constants/Strings';
import {
  GET_CONVERSATIONS_SUCCESS,
  SHOW_TOAST,
} from '../../../store/types/types';
import {myClient} from '../../../..';
import CreatePollUI from '../CreatePollUI';
import {formatDate} from '../../../commonFuctions';
import {CreatePoll, CreatePollStateProps} from '../models';
import {GetConversationsRequestBuilder} from '@likeminds.community/chat-rn';

const CreatePollScreen = ({navigation, route}: CreatePoll) => {
  const [question, setQuestion] = useState<string>('');
  const [optionsArray, setOptionsArray] = useState<any>([]);
  const [showAdvancedOption, setShowAdvancedOption] = useState<boolean>(false);
  const [addOptionsEnabled, setAddOptionsEnabled] = useState<boolean>(false);
  const [anonymousPollEnabled, setAnonymousPollEnabled] =
    useState<boolean>(false);
  const [liveResultsEnabled, setLiveResultsEnabled] = useState<boolean>(false);
  const [userVoteFor, setUserVoteFor] = useState<number>(1);
  const [voteAllowedPerUser, setVoteAllowedPerUser] = useState<number>(1);
  const [date, setDate] = useState('');
  const [mode, setMode] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const [time, setTime] = useState(new Date());
  const [isActionAlertModalVisible, setIsActionAlertModalVisible] =
    useState(false);
  const [isOptionAlertModalVisible, setIsOptionAlertModalVisible] =
    useState(false);
  const [userVoteForOptionsArrValue, setUserVoteForOptionsArrValue] = useState(
    [],
  );
  const PAGE_SIZE = 200;

  const userCanVoteForArr = ['Exactly', 'At max', 'At least'];

  const dispatch = useAppDispatch();
  const {chatroomID} = route.params;
  const {conversationsLength} = route.params;

  const setInitialHeader = () => {
    navigation.setOptions({
      title: 'New Poll',
      headerShadowVisible: false,
      headerTitleStyle: [styles.font, styles.newPollText],
      headerStyle: {backgroundColor: styles.lightGreyThumb.color},
      headerLeft: () => (
        <View style={[styles.alignRow, styles.header]}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.viewStyle}>
            <Text style={[styles.font]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  };

  // to set header of the component
  useEffect(() => {
    setInitialHeader();
  }, []);

  // to set initial poll options
  useEffect(() => {
    const id_1 = uuid.v4();
    const id_2 = uuid.v4();
    const initialOptionArray = [
      {
        id: id_1,
        text: '',
      },
      {
        id: id_2,
        text: '',
      },
    ];
    setOptionsArray(initialOptionArray);
  }, []);

  // this function handles the input poll options
  function handleInputOptionsChangeFunction(index: any, value: any) {
    const newOptions: any = [...optionsArray];
    newOptions[index].text = value;
    setOptionsArray(newOptions);
  }

  // this fucntion add the new option in poll
  function addNewOption() {
    const newOptionsArr = [...optionsArray];
    const newOption = {
      id: uuid.v4(),
      text: '',
    };
    newOptionsArr.push(newOption);
    setOptionsArray(newOptionsArr);
  }

  // this function removes option in poll
  function removeAnOption(index: any) {
    const newOptionsArr = [...optionsArray];
    newOptionsArr.splice(index, 1);
    setOptionsArray(newOptionsArr);
  }

  // this function changes mode and set date and time
  const onChange = (event: any, selectedValue: any) => {
    const isIOS = Platform.OS === 'ios';
    const newDate = new Date();

    // iOS DateTime Picker logic
    if (isIOS) {
      const currentDate = selectedValue || newDate;
      const selectedTime = selectedValue || newDate;
      setTime(selectedTime);
      setDate(currentDate);
    } else {
      // Android DateTime Picker logic
      setShow(false);
      if (mode == DATE_TEXT) {
        const currentDate = selectedValue || newDate;
        setDate(currentDate);
        setMode(TIME_TEXT);
        setShow(true); // to show the picker again in time mode
      } else {
        const selectedTime = selectedValue || newDate;
        setTime(selectedTime);
        setShow(false);
        setMode(DATE_TEXT);
      }
    }
  };

  // this function changes the mode
  const showDateTimePickerMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };

  // this function set mode "date"
  const showDatePicker = () => {
    showDateTimePickerMode(DATE_TEXT);
  };

  // this function handles question input in poll
  const handleQuestion = (val: string) => {
    setQuestion(val);
  };

  // this function toggles the advance button to show and hide advance options
  const handleShowAdvanceOption = () => {
    setShowAdvancedOption(!showAdvancedOption);
  };

  // this function handles "allow voters to add more options" toggle button
  const handleAddOptions = (val: boolean) => {
    setAddOptionsEnabled(val);
  };

  // this function handles "Anonymous poll" toggle button
  const handleAnonymousPoll = (val: boolean) => {
    setAnonymousPollEnabled(val);
  };

  // this function handles "Anonymous poll" toggle button
  const handleLiveResults = (val: boolean) => {
    setLiveResultsEnabled(val);
  };

  // this function handles "User can vote for" modal dropdown selection
  const handleUserVoteFor = (val: number) => {
    setUserVoteFor(val);
    hideActionModal();
  };

  // this function handles "Number of votes allowed per user" modal dropdown selection
  const handleVoteAllowedPerUser = (val: number) => {
    setVoteAllowedPerUser(val + 1);
    hideSelectOptionModal();
  };

  // this function handles "Cancel" button flow
  const handleOnCancel = () => {
    navigation.goBack();
  };

  // this function hides "User can vote for" modal
  const hideActionModal = () => {
    setIsActionAlertModalVisible(false);
  };

  // this function hides "Number of votes allowed per user" modal
  const hideSelectOptionModal = () => {
    setIsOptionAlertModalVisible(false);
  };

  // this function sets "User can vote for" modal interated value to the state
  const handleOpenActionModal = () => {
    const valueArr: any = userCanVoteForArr;

    setUserVoteForOptionsArrValue(valueArr);
    setIsActionAlertModalVisible(true);
  };

  // this functioin resets date and time
  const resetDateTimePicker = () => {
    setShow(false);
    setMode('');
    setDate('');
    setTime(new Date());
  };

  // this function sets "Number of votes allowed per user" modal interated value to the state
  const handleOpenOptionModal = () => {
    let quantinyArr: any = [];
    for (let i = 0; i < optionsArray.length; i++) {
      quantinyArr = [
        ...quantinyArr,
        `${i + 1 > 1 ? `${i + 1} options` : `${i + 1} option`}`,
      ];
    }
    setUserVoteForOptionsArrValue(quantinyArr);
    setIsOptionAlertModalVisible(true);
  };

  // this function fetches postPollConversation API
  async function postPoll() {
    const expiryTime = date ? formatDate(date, time) : null;
    try {
      if (question?.trim() === '') {
        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: QUESTION_WARNING},
        });
        return;
      }
      if (!expiryTime) {
        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: EXPIRY_TIME_WARNING},
        });
        return;
      }
      const tempPollOptionsMap: any = {};
      let shouldBreak = false;
      const polls = optionsArray.map((item: any) => {
        if (tempPollOptionsMap[item?.text] !== undefined) {
          dispatch({
            type: SHOW_TOAST,
            body: {isToast: true, msg: POLLS_OPTIONS_WARNING},
          });
          shouldBreak = true;
        } else {
          if (item?.text === '') {
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: EMPTY_OPTIONS_WARNING},
            });
            shouldBreak = true;
          }
          tempPollOptionsMap[item?.text] = true;
          return {
            text: item?.text,
          };
        }
      });
      if (shouldBreak) {
        return;
      }

      const payload: any = {
        chatroomId: chatroomID,
        temporaryId: Date.now().toString(),
        state: 10,
        text: question,
        polls: polls,
        pollType: liveResultsEnabled ? 1 : 0,
        multipleSelectState: showAdvancedOption ? userVoteFor : null,
        multipleSelectNo: showAdvancedOption ? voteAllowedPerUser : null,
        isAnonymous: showAdvancedOption ? anonymousPollEnabled : false,
        allowAddOption: showAdvancedOption ? addOptionsEnabled : false,
        expiryTime: Date.parse(time.toString()),
      };
      const res = await myClient.postPollConversation(payload);

      await myClient?.saveNewConversation(
        chatroomID?.toString(),
        res?.data?.conversation,
      );

      const getConversationsPayload = GetConversationsRequestBuilder.builder()
        .setChatroomId(chatroomID?.toString())
        .setLimit(PAGE_SIZE)
        .build();

      const conversations = await myClient?.getConversations(
        getConversationsPayload,
      );

      dispatch({
        type: GET_CONVERSATIONS_SUCCESS,
        body: {conversations: conversations},
      });
      handleOnCancel();
    } catch (error) {
      // process error
    }
  }

  // readonly props consumed by UI component
  const props: CreatePollStateProps = {
    show: show,
    date: date,
    mode: mode,
    userCanVoteForArr: userCanVoteForArr,
    showAdvancedOption: showAdvancedOption,
    formatedDateTime: date ? formatDate(date, time) : '',
    addOptionsEnabled: addOptionsEnabled,
    anonymousPollEnabled: anonymousPollEnabled,
    liveResultsEnabled: liveResultsEnabled,
    userVoteFor: userVoteFor,
    voteAllowedPerUser: voteAllowedPerUser,
    question: question,
    optionsArray: optionsArray,
    userVoteForOptionsArrValue: userVoteForOptionsArrValue,
    isSelectOptionModal: isOptionAlertModalVisible,
    isActionAlertModalVisible: isActionAlertModalVisible,
    timeZoneOffsetInMinutes: moment().utcOffset(),
  };

  return (
    <CreatePollUI
      onChange={onChange}
      showDatePicker={showDatePicker}
      handleQuestion={handleQuestion}
      handleShowAdvanceOption={handleShowAdvanceOption}
      handleAddOptions={handleAddOptions}
      handleAnonymousPoll={handleAnonymousPoll}
      handleLiveResults={handleLiveResults}
      handleInputOptionsChangeFunction={handleInputOptionsChangeFunction}
      removeAnOption={removeAnOption}
      addNewOption={addNewOption}
      postPoll={postPoll}
      hideActionModal={hideActionModal}
      hideSelectOptionModal={hideSelectOptionModal}
      handleOnSelect={handleUserVoteFor}
      handleOnSelectOption={handleVoteAllowedPerUser}
      handleOpenActionModal={handleOpenActionModal}
      handleOpenOptionModal={handleOpenOptionModal}
      resetDateTimePicker={resetDateTimePicker}
      {...props}
    />
  );
};

export default CreatePollScreen;
