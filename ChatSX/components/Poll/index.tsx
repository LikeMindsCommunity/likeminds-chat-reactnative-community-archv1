import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from './styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ANONYMOUS_POLL_SUB_TITLE,
  ANONYMOUS_POLL_TITLE,
  DATE_TEXT,
  DATE_TIME_TEXT,
  TIME_TEXT,
} from '../../constants/Strings';
import {POLL_RESULT} from '../../constants/Screens';
import {myClient} from '../../..';
import uuid from 'react-native-uuid';
import {SHOW_TOAST} from '../../store/types/types';
import {useAppDispatch, useAppSelector} from '../../../store';
import ActionAlertModal from '../../customModals/ActionListModel';
import moment from 'moment';
import {firebaseConversation} from '../../store/actions/chatroom';
import AnonymousPollModal from '../../customModals/AnonymousPoll';

const CreatePollModal = ({
  pollModalVisible,
  setPollModalVisible,
  chatroomID,
}: any) => {
  const handleModalClose = () => {
    setPollModalVisible(false);
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={pollModalVisible}
      onRequestClose={() => {
        setPollModalVisible(!pollModalVisible);
      }}>
      <Pressable style={styles.centeredView} onPress={handleModalClose}>
        <View style={styles.modalViewParent}>
          <Pressable onPress={() => {}} style={[styles.modalView]}>
            <View style={styles.alignModalElements}>
              <CreatePollScreen
                handleModalClose={handleModalClose}
                chatroomID={chatroomID}
              />
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default CreatePollModal;

const CreatePollScreen = ({navigation, route}: any) => {
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
  // const [isUserVoteForModal, setIsUserVoteForModal] = useState(false)
  const [isActionAlertModalVisible, setIsActionAlertModalVisible] =
    useState(false);
  const [isOptionAlertModalVisible, setIsOptionAlertModalVisible] =
    useState(false);
  const [userVoteForOptionsArrValue, setUserVoteForOptionsArrValue] = useState(
    [],
  );

  const userCanVoteForArr = ['Exactly', 'At max', 'At least'];

  const dispatch = useAppDispatch();
  const {chatroomID} = route.params;

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
    let id_1 = uuid.v4();
    let id_2 = uuid.v4();
    let initialOptionArray = [
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

  // this function formats the date in "DD/MM/YYYY hh:mm" format
  const formatDate = (date: any, time: any) => {
    console.log('date -- date =', date, time);

    let formattedTime = moment(date).format('DD/MM/YYYY hh:mm');

    return formattedTime;
  };

  // this function handles the input poll options
  function handleInputOptionsChangeFunction(index: any, value: any) {
    const newOptions: any = [...optionsArray];
    newOptions[index].text = value;
    setOptionsArray(newOptions);
  }

  // this fucntion add the new option in poll
  function addNewOption() {
    let newOptionsArr = [...optionsArray];
    let newOption = {
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
  const showMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };

  // this function set mode "date"
  const showDatePicker = () => {
    showMode(DATE_TEXT);
  };

  // this function handles question input in poll
  const handleQuestion = (val: string) => {
    setQuestion(val);
  };

  // this function toggles the advance button to show and hide advance options
  const handleShowAdvanceOption = (val: boolean) => {
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
    let valueArr: any = userCanVoteForArr;

    setUserVoteForOptionsArrValue(valueArr);
    setIsActionAlertModalVisible(true);
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
    let expiryTime = !!date ? formatDate(date, time) : null;
    console.log('expiry ==', expiryTime);
    // dispatch({
    //   type: SHOW_TOAST,
    //   body: {isToast: true, msg: 'Question Field cannot be empty'},
    // });
    try {
      console.log('question ==', question);
      if (question?.trim() === '') {
        console.log('Question Field cannot be empty');
        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: 'Question Field cannot be empty'},
        });
        return;
      }
      if (!expiryTime) {
        console.log('Please select expiry time');
        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: 'Please select expiry time'},
        });
        return;
      }
      console.log('2');
      const tempPollOptionsMap: any = {};
      let shouldBreak = false;
      const polls = optionsArray.map((item: any) => {
        if (tempPollOptionsMap[item?.text] !== undefined) {
          console.log("Poll options can't be the same");
          dispatch({
            type: SHOW_TOAST,
            body: {isToast: true, msg: "Poll options can't be the same"},
          });
          shouldBreak = true;
        } else {
          if (item?.text === '') {
            console.log('Empty options are not allowed');
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: 'Empty options are not allowed'},
            });
            shouldBreak = true;
          }
          tempPollOptionsMap[item?.text] = true;
          return {
            text: item?.text,
          };
        }
      });
      console.log('3');
      if (shouldBreak) {
        console.log('shouldBreak ==', shouldBreak);
        return;
      }

      console.log('chatroom ID ==', Date.parse(time.toString()));
      const payload: any = {
        chatroomId: chatroomID,
        temporaryId: Date.now().toString(),
        state: 10,
        text: question,
        polls: polls,
        pollType: liveResultsEnabled ? 1 : 0,
        multipleSelectState: showAdvancedOption ? userVoteFor : 1,
        multipleSelectNo: showAdvancedOption ? voteAllowedPerUser : 1,
        isAnonymous: showAdvancedOption ? anonymousPollEnabled : false,
        allowAddOption: showAdvancedOption ? addOptionsEnabled : false,
        expiryTime: Date.parse(time.toString()),
      };
      const res = await myClient.postPollConversation(payload);

      console.log(res);
      handleOnCancel();
    } catch (error) {
      console.log(error);
    }
  }

  // readonly props consumed by UI component
  const props: any = {
    show: show,
    date: date,
    mode: mode,
    userCanVoteForArr: userCanVoteForArr,
    showAdvancedOption: showAdvancedOption,
    formatedDateTime: !!date ? formatDate(date, time) : '',
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
      // hue={150}
      showDatePicker={showDatePicker}
      handleQuestion={handleQuestion}
      handleShowAdvanceOption={handleShowAdvanceOption}
      handleAddOptions={handleAddOptions}
      handleAnonymousPoll={handleAnonymousPoll}
      handleLiveResults={handleLiveResults}
      onCancel={handleOnCancel}
      handleInputOptionsChangeFunction={handleInputOptionsChangeFunction}
      removeAnOption={removeAnOption}
      addNewOption={addNewOption}
      postPoll={postPoll}
      hideActionModal={hideActionModal}
      hideSelectOptionModal={hideSelectOptionModal}
      // handleUserVoteFor={handleUserVoteFor}
      // handleVoteAllowedPerUser={handleVoteAllowedPerUser}
      handleOnSelect={handleUserVoteFor}
      handleOnSelectOption={handleVoteAllowedPerUser}
      handleOpenActionModal={handleOpenActionModal}
      handleOpenOptionModal={handleOpenOptionModal}
      {...props}
    />
  );
};

const CreatePollUI = ({
  hue,
  show,
  date,
  mode,
  onChange,
  showDatePicker,
  userCanVoteForArr,
  optionsArray,
  showAdvancedOption,
  formatedDateTime,
  timeZoneOffsetInMinutes,
  addOptionsEnabled,
  anonymousPollEnabled,
  liveResultsEnabled,
  question,

  hideActionModal,
  hideSelectOptionModal,
  isSelectOptionModal,
  userVoteForOptionsArrValue,

  isActionAlertModalVisible,

  handleShowAdvanceOption,
  userVoteFor,
  voteAllowedPerUser,
  handleAddOptions,
  handleAnonymousPoll,
  handleLiveResults,
  handleUserVoteFor,
  onCancel,
  handleInputOptionsChangeFunction,
  addNewOption,
  removeAnOption,
  postPoll,
  handleQuestion,

  handleOnSelect,
  handleOnSelectOption,
  handleOpenActionModal,
  handleOpenOptionModal,
}: any) => {
  return (
    <ScrollView bounces={false}>
      {/* Poll question */}
      <View style={styles.pollQuestion}>
        <View>
          <Text
            style={[
              styles.font,
              hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            Poll question
          </Text>
        </View>
        <View style={styles.question}>
          <TextInput
            value={question}
            onChangeText={handleQuestion}
            placeholder={'Which is the best design tool that you have used?'}
            style={[styles.font, styles.blackColor]}
            placeholderTextColor="#aaa"
            multiline
          />
        </View>
      </View>

      {/* Answers options */}
      <View style={styles.answerOptions}>
        <View style={styles.paddingHorizontal15}>
          <Text
            style={[
              styles.font,
              hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            Answer options
          </Text>
        </View>

        {optionsArray.map((option: any, index: any) => {
          return (
            <View key={index} style={styles.question}>
              <View
                style={[
                  styles.alignRow,
                  styles.justifySpace,
                  styles.borderBottom,
                  styles.paddingHorizontal15,
                ]}>
                <TextInput
                  value={option?.text}
                  placeholder={'Option'}
                  style={[styles.font, styles.option, styles.blackColor]}
                  placeholderTextColor="#aaa"
                  onChangeText={(e: any) => {
                    handleInputOptionsChangeFunction(index, e);
                  }}
                />
                {index > 1 ? (
                  <TouchableOpacity
                    onPress={() => {
                      removeAnOption(index);
                    }}>
                    <Image
                      style={[
                        styles.pollIcon,
                        {tintColor: styles.blackColor.color},
                      ]}
                      source={require('../../assets/images/cross_icon3x.png')}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          onPress={addNewOption}
          style={[
            styles.alignRow,
            styles.marginSpace,
            styles.paddingHorizontal15,
          ]}>
          <Image
            style={[
              styles.optionIcon,
              hue ? {tintColor: `hsl(${hue}, 53%, 15%)`} : null,
            ]}
            source={require('../../assets/images/add_options3x.png')}
          />
          <Text
            style={[
              styles.text,
              styles.addOptionText,
              hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            Add an option...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Poll expire Time and Date selection */}
      <View style={[styles.answerOptions, styles.paddingHorizontal15]}>
        <View>
          <Text
            style={[
              styles.font,
              hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            Poll expires on
          </Text>
        </View>
        <View style={styles.question}>
          <TouchableOpacity
            onPress={() => {
              showDatePicker();
            }}>
            <Text
              style={[
                styles.font,
                formatedDateTime ? styles.blackColor : styles.placeHolder,
              ]}>
              {formatedDateTime ? formatedDateTime : 'DD-MM-YYYY hh:mm'}
            </Text>
            {/* Date Time Picker */}
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                timeZoneOffsetInMinutes={timeZoneOffsetInMinutes}
                value={date ? date : new Date()}
                mode={Platform.OS === 'ios' ? 'datetime' : mode}
                is24Hour={true}
                display="default"
                onChange={onChange}
                minimumDate={mode === 'date' ? new Date() : undefined}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Advance options toggle button */}
      <TouchableOpacity
        style={styles.extraMarginSpace}
        onPress={() => {
          handleShowAdvanceOption();
        }}>
        <Text
          style={[
            styles.font,
            styles.lightGreyBackground,
            styles.textAlignCenter,
          ]}>
          ADVANCED
        </Text>
      </TouchableOpacity>

      {/* Advance options*/}
      {showAdvancedOption ? (
        <View style={[styles.answerOptions, styles.paddingHorizontal15]}>
          <View style={[styles.alignRow, styles.justifySpace]}>
            <Text style={[styles.font, styles.blackColor]}>
              Allow voters to add the option
            </Text>
            <Switch
              trackColor={{
                false: styles.lightGreyBackground.color,
                true: hue ? `hsl(${hue}, 53%, 15%)` : styles.primaryColor.color,
              }}
              thumbColor={
                addOptionsEnabled
                  ? hue
                    ? `hsl(${hue}, 40%, 40%)`
                    : styles.lightPrimaryColor.color
                  : styles.lightGreyThumb.color
              }
              ios_backgroundColor={styles.lightGreyBackground.color}
              onValueChange={handleAddOptions}
              value={addOptionsEnabled}
            />
          </View>
          <View
            style={[styles.alignRow, styles.justifySpace, styles.marginSpace]}>
            <Text style={[styles.font, styles.blackColor]}>Anonymous Poll</Text>
            <Switch
              trackColor={{
                false: styles.lightGreyBackground.color,
                true: hue ? `hsl(${hue}, 53%, 15%)` : styles.primaryColor.color,
              }}
              thumbColor={
                anonymousPollEnabled
                  ? hue
                    ? `hsl(${hue}, 40%, 40%)`
                    : styles.lightPrimaryColor.color
                  : styles.lightGreyThumb.color
              }
              ios_backgroundColor={styles.lightGreyBackground.color}
              onValueChange={handleAnonymousPoll}
              value={anonymousPollEnabled}
            />
          </View>
          <View
            style={[styles.alignRow, styles.justifySpace, styles.marginSpace]}>
            <Text style={[styles.font, styles.blackColor]}>
              Don't show live results
            </Text>
            <Switch
              trackColor={{
                false: styles.lightGreyBackground.color,
                true: hue ? `hsl(${hue}, 53%, 15%)` : styles.primaryColor.color,
              }}
              thumbColor={
                liveResultsEnabled
                  ? hue
                    ? `hsl(${hue}, 40%, 40%)`
                    : styles.lightPrimaryColor.color
                  : styles.lightGreyThumb.color
              }
              ios_backgroundColor={styles.lightGreyBackground.color}
              onValueChange={handleLiveResults}
              value={liveResultsEnabled}
            />
          </View>
          <View
            style={[styles.alignRow, styles.justifySpace, styles.marginSpace]}>
            <Text style={[styles.smallText, styles.greyColor]}>
              User can vote for
            </Text>
          </View>
          <View
            style={[styles.alignRow, styles.justifySpace, styles.marginSpace]}>
            <TouchableOpacity
              onPress={() => {
                handleOpenActionModal();
              }}
              style={{flexGrow: 1}}>
              <Text style={[styles.text, styles.blackColor]}>
                {userCanVoteForArr[userVoteFor]}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleOpenOptionModal();
              }}
              style={{flexGrow: 1}}>
              <Text style={[styles.text, styles.blackColor]}>
                {!voteAllowedPerUser
                  ? 'Select option'
                  : `${
                      voteAllowedPerUser > 1
                        ? `${voteAllowedPerUser} options`
                        : `${voteAllowedPerUser} option`
                    }`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Post button */}
      <TouchableOpacity
        onPress={() => {
          postPoll();
        }}
        style={[
          styles.extraMarginSpace,
          styles.postButton,
          hue ? {backgroundColor: `hsl(${hue}, 53%, 15%)`} : null,
        ]}>
        <Text style={[styles.font, styles.whiteColor]}>POST</Text>
      </TouchableOpacity>

      {/* User can vote for option Modal */}
      <ActionAlertModal
        hideActionModal={hideActionModal}
        actionAlertModalVisible={isActionAlertModalVisible}
        optionsList={userVoteForOptionsArrValue}
        onSelect={handleOnSelect}
      />

      {/* option count Modal */}
      <ActionAlertModal
        hideActionModal={hideSelectOptionModal}
        actionAlertModalVisible={isSelectOptionModal}
        optionsList={userVoteForOptionsArrValue}
        onSelect={handleOnSelectOption}
      />
    </ScrollView>
  );
};

const PollConversationView = ({navigation, item}: any) => {
  const [selectedPolls, setSelectedPolls] = useState<any>([]);
  const [showSelected, setShowSelected] = useState(false);
  const [shouldShowSubmitPollButton, setShouldShowSubmitPollButton] =
    useState(false);
  const [showResultsButton, setShowResultsButton] = useState(false);
  const [isAddPollOptionModalVisible, setIsAddPollOptionModalVisible] =
    useState(false);
  const [addOptionInputField, setAddOptionInputField] = useState('');
  const [hasPollEnded, setHasPollEnded] = useState(false);
  const [shouldShowVotes, setShouldShowVotes] = useState(false);
  const [pollVoteCount, setPollVoteCount] = useState(0);
  const [isAnonymousPollModalVisible, setIsAnonymousPollModalVisible] =
    useState(false);

  const {user} = useAppSelector(item => item.homefeed);

  const dispatch = useAppDispatch();

  let pollsArr = item?.polls;

  // this function navigates to poll result screen if we click on votes or show alert in case of anonymous poll
  const onNavigate = () => {
    if (item?.is_anonymous) {
      setIsAnonymousPollModalVisible(true);
    } else {
      navigation.navigate(POLL_RESULT, {
        tabsValueArr: pollsArr,
        conversationID: item?.id,
      });
    }
  };

  // this functions have submit poll button logics
  const submitPollLogics = () => {
    if (item?.multiple_select_no === undefined) {
      // defensive check
      if (selectedPolls.length > 0) {
        setShouldShowSubmitPollButton(true);
      } else {
        setShouldShowSubmitPollButton(false);
      }
    } else {
      const MAX_POLL_OPTIONS = item?.multiple_select_no;

      switch (item?.multiple_select_state) {
        // defensive check
        case undefined: {
          setShouldShowSubmitPollButton(false);
          break;
        }

        case 0: {
          // Exactly
          if (selectedPolls.length === MAX_POLL_OPTIONS) {
            setShouldShowSubmitPollButton(true);
            console.log('show poll submit button');
          } else if (selectedPolls.length > MAX_POLL_OPTIONS) {
            console.log('Error here');
          }
        }

        case 1: {
          if (
            selectedPolls.length <= item.multiple_select_no &&
            selectedPolls.length > 0
          ) {
            setShouldShowSubmitPollButton(true);
          } else {
            setShouldShowSubmitPollButton(false);
          }
          break;
        }

        case 2: {
          if (selectedPolls.length >= item.multiple_select_no) {
            setShouldShowSubmitPollButton(true);
          } else {
            setShouldShowSubmitPollButton(false);
          }
          break;
        }

        default: {
          setShouldShowSubmitPollButton(false);
        }
      }
    }
  };

  // this useEffects monitors the interaction in poll options, according to which we have to show submit button
  useEffect(() => {
    submitPollLogics();
  }, [selectedPolls]);

  // check if user already answered on th poll or not
  useEffect(() => {
    let count = 0;
    const res = pollsArr?.forEach((poll: any) => {
      if (poll.is_selected === true) {
        count = count + 1;
      }
    });
    if (count > 0) {
      setShouldShowVotes(true);
    } else {
      setShouldShowVotes(false);
    }

    setPollVoteCount(count);
  }, [pollsArr]);

  // Poll end timer logic
  useEffect(() => {
    const difference = item?.expiry_time - Date.now();

    if (difference > 0) {
      setHasPollEnded(false);
    } else {
      setHasPollEnded(true);
    }
    if (difference > 0) {
      let timer = setTimeout(() => {
        setHasPollEnded(true);
      }, difference);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  // this function triggers when have to hide anonymous poll modal
  const hideAnonymousPollModal = () => {
    setIsAnonymousPollModalVisible(false);
  };

  // API to reload the existing poll conversation
  async function reloadConversation() {
    let payload = {
      chatroomId: item?.chatroom_id,
      conversationId: item?.id,
    };
    const res = await dispatch(firebaseConversation(payload, false) as any);
  }

  // this function call an API which adds a poll option in existing poll
  async function addPollOption() {
    try {
      if (addOptionInputField.length === 0) {
        return;
      }

      setIsAddPollOptionModalVisible(false);

      const pollObject = {
        text: addOptionInputField,
      };
      const addPollCall = await myClient.addPollOption({
        conversationId: item?.id,
        poll: pollObject,
      });

      await reloadConversation();
    } catch (error) {
      console.log('error at addPollOption');
      console.log(error);
    }
  }

  // this function used we interact with poll options
  async function setSelectedPollOptions(pollIndex: any) {
    if (Date.now() > item?.expiry_time) {
      Alert.alert('expired');
      return;
    }
    const newSelectedPolls = [...selectedPolls];
    const isPollIndexIncluded = newSelectedPolls.includes(pollIndex);

    if (isPollIndexIncluded) {
      // if poll item is already selected
      const selectedIndex = newSelectedPolls.findIndex(
        index => index === pollIndex,
      );
      newSelectedPolls.splice(selectedIndex, 1);
    } else {
      console.log('000 ==', item?.multiple_select_state);

      // if only one option is allowed
      if (item?.multiple_select_no === 1) {
        // can change selected ouptput in deferred poll
        if (item?.poll_type === 1) {
          const pollSubmissionCall = await myClient.submitPoll({
            conversationId: item?.id,
            polls: [item?.polls[pollIndex]],
          });
          await reloadConversation();
        } else {
          // for instant poll selection only for once

          const isSelected = pollsArr?.some((poll: any) => {
            return poll?.is_selected;
          });

          // if not selected
          if (!isSelected) {
            const pollSubmissionCall = await myClient.submitPoll({
              conversationId: item?.id,
              polls: [item?.polls[pollIndex]],
            });
            await reloadConversation();
          } else {
            alert('Already Voted');
          }
        }
        return;
      }

      // multiple options are allowed
      switch (item?.multiple_select_state) {
        case 0: {
          console.log('111');
          if (selectedPolls.length === item?.multiple_select_no) {
            console.log('222');
            return;
          }
          break;
        }
        case 1: {
          console.log('111ss', selectedPolls.length, item?.multiple_select_no);
          if (selectedPolls.length == item?.multiple_select_no) {
            console.log('222sss');
            return;
          }
          break;
        }
      }
      newSelectedPolls.push(pollIndex);
    }
    setSelectedPolls(newSelectedPolls);
  }

  // this function call submit poll button API
  async function submitPoll() {
    try {
      const polls = selectedPolls?.map((itemIndex: any) => {
        return item?.polls[itemIndex];
      });
      const pollSubmissionCall = await myClient.submitPoll({
        conversationId: item?.id,
        polls: polls,
      });
      await reloadConversation();
    } catch (error) {
      console.log('error at poll submission');
      console.log(error);
    }
  }

  // readonly props consumed by UI component
  let props: any = {
    text: item?.answer,
    votes: pollVoteCount,
    optionArr: item?.polls,
    pollTypeText: item?.poll_type_text,
    submitTypeText: item?.submit_type_text,
    addOptionInputField: addOptionInputField,
    shouldShowSubmitPollButton: shouldShowSubmitPollButton,
    selectedPolls: selectedPolls,
    showSelected: showSelected,
    allowAddOption: item?.allow_add_option,
    shouldShowVotes: shouldShowVotes,
    hasPollEnded: hasPollEnded,
    expiryTime: moment(item?.expiry_time).fromNow(),
    toShowResults: item?.to_show_results,
    member: item?.member,
    user: user,
    isEdited: item?.is_edited,
    createdAt: item?.created_at,
    pollAnswerText: item?.poll_answer_text,
    isPollEnded: Date.now() > item?.expiry_time ? false : true,
  };

  return (
    <View>
      <PollConversationUI
        onNavigate={onNavigate}
        setSelectedPollOptions={setSelectedPollOptions}
        addPollOption={addPollOption}
        submitPoll={submitPoll}
        setShowSelected={setShowSelected}
        setIsAddPollOptionModalVisible={setIsAddPollOptionModalVisible}
        setAddOptionInputField={setAddOptionInputField}
        {...props}
      />
      <AddOptionsModal
        isAddPollOptionModalVisible={isAddPollOptionModalVisible}
        setIsAddPollOptionModalVisible={setIsAddPollOptionModalVisible}
        addOptionInputField={addOptionInputField}
        setAddOptionInputField={setAddOptionInputField}
        handelAddOptionSubmit={addPollOption}
      />
      <AnonymousPollModal
        isAnonymousPollModalVisible={isAnonymousPollModalVisible}
        hideAnonymousPollModal={hideAnonymousPollModal}
        title={ANONYMOUS_POLL_TITLE}
        subTitle={ANONYMOUS_POLL_SUB_TITLE}
      />
    </View>
  );
};

const PollConversationUI = ({
  text,
  hue,
  onNavigate,
  optionArr,
  submitTypeText,
  pollTypeText,
  selectedPolls,
  shouldShowSubmitPollButton,
  setSelectedPollOptions,
  submitPoll,
  showSelected,
  setShowSelected,
  allowAddOption,
  shouldShowVotes,
  setIsAddPollOptionModalVisible,
  hasPollEnded,
  expiryTime,
  toShowResults,
  member,
  user,
  isEdited,
  createdAt,
  pollAnswerText,
  isPollEnded,
}: any) => {
  return (
    <View>
      {!!(member?.id === user?.id) ? null : (
        <Text style={styles.messageInfo} numberOfLines={1}>
          {member?.name}
          {!!member?.custom_title ? (
            <Text
              style={
                styles.messageCustomTitle
              }>{` • ${member?.custom_title}`}</Text>
          ) : null}
        </Text>
      )}

      {/* Poll heading */}
      <View style={[styles.alignRow, styles.gap]}>
        <Text style={[styles.smallText, styles.greyColor]}>{pollTypeText}</Text>
        <Text
          style={[
            styles.smallText,
            styles.greyColor,
          ]}>{`• ${submitTypeText}`}</Text>
      </View>

      {/* Poll question */}
      <View style={styles.extraMarginSpace}>
        <View style={[styles.alignRow, styles.justifySpace]}>
          <View
            style={[
              styles.pollIconParent,
              hue ? {backgroundColor: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            <Image
              source={require('../../assets/images/poll_icon3x.png')}
              style={styles.pollIcon}
            />
          </View>
          <View
            style={[
              styles.pollEndedTime,
              hue ? {backgroundColor: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            <Text style={[styles.smallText, styles.whiteColor]}>
              {hasPollEnded ? 'Poll Ended' : 'Poll Ends ' + expiryTime}
            </Text>
          </View>
        </View>

        <Text style={[styles.text, styles.blackColor, styles.marginSpace]}>
          {text}
        </Text>

        {/* <Text
          style={[
            styles.smallText,
            styles.greyColor,
          ]}>{`Select `}</Text> */}
      </View>

      {/* Poll Options*/}
      <View style={[styles.extraMarginSpace, styles.gap10]}>
        {optionArr?.map((element: any, index: any) => {
          console.log('element ==', element);
          let isSelected = selectedPolls.includes(index);
          let voteCount = element?.no_votes;
          console.log('isSelected', isSelected);
          return (
            <View key={element?.id} style={styles.gap}>
              <Pressable
                onPress={() => {
                  setShowSelected(!showSelected);
                  setSelectedPollOptions(index);
                }}
                style={({pressed}) => [
                  isSelected || element?.is_selected
                    ? styles.pollButton
                    : styles.greyPollButton,
                  {opacity: pressed ? 0.5 : 1},
                  hue ? {borderColor: `hsl(${hue}, 47%, 31%)`} : null,
                ]}>
                <View
                  style={[
                    voteCount < 0
                      ? [
                          {
                            width: '100%',
                            backgroundColor: 'white',
                          },
                          {padding: 0, margin: 0, borderRadius: 8},
                        ]
                      : null,
                  ]}>
                  <Text
                    style={[
                      styles.text,
                      styles.blackColor,
                      {
                        position: 'absolute',
                        zIndex: 1,
                        alignItems: 'center',
                        left: 5,
                        top: '35%',
                      },
                    ]}>
                    {element?.text}
                  </Text>
                  <View
                    style={[
                      voteCount > 0
                        ? [
                            {
                              width: `${
                                element?.percentage > 98
                                  ? 98
                                  : element?.percentage
                              }%`,
                              backgroundColor: hue
                                ? `hsl(${hue}, 60%, 85%)`
                                : `hsl(222, 60%, 85%)`,
                            },
                            styles.pollButtonBackground,
                            styles.pollButtonPadding,
                          ]
                        : [
                            styles.pollButtonBackground,
                            styles.pollButtonPadding,
                          ],
                    ]}
                  />
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  onNavigate();
                }}>
                <Text
                  style={[
                    styles.smallText,
                    {marginLeft: 5},
                    !!(voteCount < 1) ? styles.greyColor : null,
                  ]}>{`${voteCount} ${voteCount > 1 ? 'votes' : 'vote'}`}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Add more options button */}
      {allowAddOption && isPollEnded ? (
        <View style={[styles.extraMarginSpace]}>
          <Pressable
            onPress={() => {
              setIsAddPollOptionModalVisible(true);
            }}
            style={({pressed}) => [
              styles.pollButton,
              {opacity: pressed ? 0.5 : 1, padding: 12},
              hue ? {borderColor: `hsl(${hue}, 47%, 31%)`} : null,
            ]}>
            <Text
              style={[styles.text, styles.blackColor, styles.textAlignCenter]}>
              + Add an option
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Poll answer text */}
      {toShowResults === true ? (
        <Pressable
          onPress={() => {
            onNavigate();
          }}>
          <Text
            style={[
              styles.mediumText,
              styles.extraMarginSpace,
              hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            {pollAnswerText}
          </Text>
        </Pressable>
      ) : null}

      {/* Submit vote button */}
      {!shouldShowVotes && isPollEnded ? (
        <View style={styles.marginSpace}>
          <TouchableOpacity
            onPress={() => {
              if (shouldShowSubmitPollButton) {
                submitPoll();
              }
            }}
            style={[
              styles.submitVoteButton,
              !shouldShowSubmitPollButton ? styles.greyBorder : null,
              {backgroundColor: styles.whiteColor.color},
              hue ? {backgroundColor: `hsl(${hue}, 47%, 31%)`} : null,
            ]}>
            <Text
              style={[
                styles.textAlignCenter,
                styles.smallTextMedium,
                !shouldShowSubmitPollButton ? styles.greyColor : null,
              ]}>
              SUBMIT VOTE
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Poll timestamp and show edited text if edited */}
      <View style={styles.alignTime}>
        {isEdited ? (
          <Text style={styles.messageDate}>{`Edited • `}</Text>
        ) : null}
        <Text style={styles.messageDate}>{createdAt}</Text>
      </View>
    </View>
  );
};

{
  /* Add more options in poll modal */
}
const AddOptionsModal = ({
  isAddPollOptionModalVisible,
  setIsAddPollOptionModalVisible,
  addOptionInputField,
  setAddOptionInputField,
  handelAddOptionSubmit,
}: any) => {
  const handleModalClose = () => {
    setIsAddPollOptionModalVisible(false);
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isAddPollOptionModalVisible}
      onRequestClose={() => {
        handleModalClose();
      }}>
      <Pressable style={styles.centeredView} onPress={handleModalClose}>
        <View style={styles.addOptionsModalViewParent}>
          <Pressable onPress={() => {}} style={[styles.modalView]}>
            <View style={styles.alignModalElements}>
              <AddOptionUI
                setIsAddPollOptionModalVisible={setIsAddPollOptionModalVisible}
                addOptionInputField={addOptionInputField}
                setAddOptionInputField={setAddOptionInputField}
                handelAddOptionSubmit={handelAddOptionSubmit}
              />
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

{
  /* Add more options in poll modal UI */
}
const AddOptionUI = ({
  hue,
  addOptionInputField,
  setAddOptionInputField,
  setIsAddPollOptionModalVisible,
  handelAddOptionSubmit,
}: any) => {
  return (
    <View>
      <View style={styles.padding20}>
        <TouchableOpacity
          onPress={() => {
            setIsAddPollOptionModalVisible(false);
          }}
          style={[{alignSelf: 'flex-end'}]}>
          <Image
            style={[styles.pollIcon, {tintColor: styles.blackColor.color}]}
            source={require('../../assets/images/cross_icon3x.png')}
          />
        </TouchableOpacity>
        <View>
          <Text style={[styles.boldText, styles.blackColor]}>
            Add new poll option
          </Text>
          <Text
            style={[styles.smallText, styles.greyColor, styles.marginSpace]}>
            Enter an option that you thinkis missing in this poll. This can not
            be undone.
          </Text>
        </View>
        <View style={styles.extraMarginSpace}>
          <TextInput
            value={addOptionInputField}
            onChangeText={setAddOptionInputField}
            placeholder={'Type new option'}
            placeholderTextColor="#aaa"
            style={styles.textInput}
          />
        </View>
        <View style={styles.extraMarginSpace}>
          <TouchableOpacity
            onPress={handelAddOptionSubmit}
            style={[
              styles.submitButton,
              hue ? {backgroundColor: `hsl(${hue}, 47%, 31%)`} : null,
            ]}>
            <Text
              style={[
                styles.mediumBoldText,
                styles.whiteColor,
                styles.textAlignCenter,
              ]}>
              SUBMIT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export {
  CreatePollUI,
  CreatePollScreen,
  PollConversationUI,
  PollConversationView,
};
