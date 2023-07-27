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
  POLL_MULTIPLE_STATE_EXACTLY,
  POLL_MULTIPLE_STATE_LEAST,
  POLL_MULTIPLE_STATE_MAX,
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

  const handleShowDateTimePicker = () => {
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
    let expiryTime = !!date ? formatDate(date, time) : null;
    console.log('expiry ==', expiryTime);
    // dispatch({
    //   type: SHOW_TOAST,
    //   body: {isToast: true, msg: 'Question Field cannot be empty'},
    // });
    try {
      if (question?.trim() === '') {
        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: 'Question Field cannot be empty'},
        });
        return;
      }
      if (!expiryTime) {
        dispatch({
          type: SHOW_TOAST,
          body: {isToast: true, msg: 'Please select expiry time'},
        });
        return;
      }
      const tempPollOptionsMap: any = {};
      let shouldBreak = false;
      const polls = optionsArray.map((item: any) => {
        if (tempPollOptionsMap[item?.text] !== undefined) {
          dispatch({
            type: SHOW_TOAST,
            body: {isToast: true, msg: "Poll options can't be the same"},
          });
          shouldBreak = true;
        } else {
          if (item?.text === '') {
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
        multipleSelectState: showAdvancedOption ? userVoteFor : 1,
        multipleSelectNo: showAdvancedOption ? voteAllowedPerUser : 1,
        isAnonymous: showAdvancedOption ? anonymousPollEnabled : false,
        allowAddOption: showAdvancedOption ? addOptionsEnabled : false,
        expiryTime: Date.parse(time.toString()),
      };
      const res = await myClient.postPollConversation(payload);
      handleOnCancel();
    } catch (error) {
      // console.log(error);
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
      handleShowDateTimePicker={handleShowDateTimePicker}
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
  handleShowDateTimePicker,
}: any) => {
  return (
    <View>
      <ScrollView contentContainerStyle={{paddingBottom: 50}} bounces={false}>
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
              placeholder={'Ask a question'}
              style={[styles.font, styles.blackColor]}
              placeholderTextColor="#c5c5c5"
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
                    style={[
                      styles.font,
                      styles.option,
                      styles.blackColor,
                      {flex: 1},
                    ]}
                    placeholderTextColor="#c5c5c5"
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
              <View
                style={[
                  styles.alignRow,
                  styles.justifySpace,
                  {marginBottom: 10},
                ]}>
                <Text
                  style={[
                    styles.font,
                    formatedDateTime ? styles.blackColor : styles.placeHolder,
                  ]}>
                  {formatedDateTime ? formatedDateTime : 'DD-MM-YYYY hh:mm'}
                </Text>
                {formatedDateTime ? (
                  <TouchableOpacity
                    onPress={() => {
                      handleShowDateTimePicker();
                      // removeAnOption(index);
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
          style={[
            styles.extraMarginSpace,
            styles.alignRow,
            styles.justifyCenter,
            styles.gap,
          ]}
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
          <Image
            style={styles.downArrow}
            source={
              !showAdvancedOption
                ? require('../../assets/images/expand_arrow3x.png')
                : require('../../assets/images/minimize_arrow3x.png')
            }
          />
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
                  true: hue
                    ? `hsl(${hue}, 53%, 15%)`
                    : styles.primaryColor.color,
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
              style={[
                styles.alignRow,
                styles.justifySpace,
                styles.marginSpace,
              ]}>
              <Text style={[styles.font, styles.blackColor]}>
                Anonymous Poll
              </Text>
              <Switch
                trackColor={{
                  false: styles.lightGreyBackground.color,
                  true: hue
                    ? `hsl(${hue}, 53%, 15%)`
                    : styles.primaryColor.color,
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
              style={[
                styles.alignRow,
                styles.justifySpace,
                styles.marginSpace,
              ]}>
              <Text style={[styles.font, styles.blackColor]}>
                Don't show live results
              </Text>
              <Switch
                trackColor={{
                  false: styles.lightGreyBackground.color,
                  true: hue
                    ? `hsl(${hue}, 53%, 15%)`
                    : styles.primaryColor.color,
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
              style={[
                styles.alignRow,
                styles.justifySpace,
                styles.marginSpace,
              ]}>
              <Text style={[styles.smallText, styles.greyColor]}>
                User can vote for
              </Text>
            </View>
            <View
              style={[
                styles.alignRow,
                styles.justifySpace,
                styles.marginSpace,
              ]}>
              <TouchableOpacity
                onPress={() => {
                  handleOpenActionModal();
                }}
                style={[
                  {flexGrow: 1},
                  styles.alignRow,
                  styles.justifySpace,
                  {marginRight: 30},
                ]}>
                <Text style={[styles.text, styles.blackColor]}>
                  {userCanVoteForArr[userVoteFor]}
                </Text>
                <Image
                  style={styles.pollIcon}
                  source={require('../../assets/images/sort_down3x.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleOpenOptionModal();
                }}
                style={[styles.alignRow, styles.justifySpace, {flexGrow: 1}]}>
                <Text style={[styles.text, styles.blackColor]}>
                  {!voteAllowedPerUser
                    ? 'Select option'
                    : `${
                        voteAllowedPerUser > 1
                          ? `${voteAllowedPerUser} options`
                          : `${voteAllowedPerUser} option`
                      }`}
                </Text>
                <Image
                  style={styles.pollIcon}
                  source={require('../../assets/images/sort_down3x.png')}
                />
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
    </View>
  );
};

const PollConversationView = ({
  navigation,
  item,
  isIncluded,
  openKeyboard,
  longPressOpenKeyboard,
}: any) => {
  const [selectedPolls, setSelectedPolls] = useState<any>([]);
  const [showSelected, setShowSelected] = useState(false);
  const [shouldShowSubmitPollButton, setShouldShowSubmitPollButton] =
    useState(false);
  const [allowAddOption, setAllowAddOption] = useState(false);
  const [showResultsButton, setShowResultsButton] = useState(false);
  const [isAddPollOptionModalVisible, setIsAddPollOptionModalVisible] =
    useState(false);
  const [addOptionInputField, setAddOptionInputField] = useState('');
  const [hasPollEnded, setHasPollEnded] = useState(false);
  const [shouldShowVotes, setShouldShowVotes] = useState(false);
  const [pollVoteCount, setPollVoteCount] = useState(0);
  const [isAnonymousPollModalVisible, setIsAnonymousPollModalVisible] =
    useState(false);
  const [pollsArr, setPollsArr] = useState(item?.polls);

  const {user} = useAppSelector(item => item.homefeed);

  const dispatch = useAppDispatch();

  // let pollsArr = item?.polls;

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
          if (selectedPolls.length === MAX_POLL_OPTIONS) {
            // show submit poll button
            setShouldShowSubmitPollButton(true);
          } else if (selectedPolls.length > MAX_POLL_OPTIONS) {
             // show toast
            console.log('Error here');
          }
          break;
        }

        case 0: {
          // Exactly
          if (selectedPolls.length === MAX_POLL_OPTIONS) {
             // show submit poll button
            setShouldShowSubmitPollButton(true);
          } else if (selectedPolls.length > MAX_POLL_OPTIONS) {
             // show toast
            console.log('Error here');
          }
          break;
        }

        case 1: {
          if (
            selectedPolls.length <= item.multiple_select_no &&
            selectedPolls.length > 0
          ) {
             // show submit poll button
            setShouldShowSubmitPollButton(true);
          } else {
             // hide submit poll button
            setShouldShowSubmitPollButton(false);
          }
          break;
        }

        case 2: {
          if (selectedPolls.length >= item.multiple_select_no) {
             // show submit poll button
            setShouldShowSubmitPollButton(true);
          } else {
             // hide submit poll button
            setShouldShowSubmitPollButton(false);
          }
          break;
        }

        default: {
           // hide submit poll button
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
      setAllowAddOption(false);
      setShouldShowVotes(true);

      // deffered poll show edit button state updation logic
      if (item?.poll_type === 1) {
        setShowResultsButton(true);
      }
    } else {
      setAllowAddOption(item?.allow_add_option);
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
  // this function resets showResult state
  const resetShowResult = () => {
    let arr = pollsArr.map((item: any) => {
      return {
        ...item,
        is_selected: false,
        percentage: 0,
        no_votes: 0,
      };
    });
    setPollsArr([...arr]);
    setShowResultsButton(false);
    setShouldShowVotes(false);
    setSelectedPolls([]);
  };

  useEffect(() => {
    setPollsArr(item?.polls);
  }, [item?.polls]);

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
      console.log('error at addPollOption', error);
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
      const isSelected = item?.polls?.some((poll: any) => {
        return poll?.is_selected;
      });
      // if (isSelected) {
      //   alert('Already voted');
      //   return;
      // }
      const selectedIndex = newSelectedPolls.findIndex(
        index => index === pollIndex,
      );
      newSelectedPolls.splice(selectedIndex, 1);
    } else {
      const isSelected = pollsArr?.some((poll: any) => {
        return poll?.is_selected;
      });

      if (isSelected && item?.poll_type === 0) {
        alert('Already voted');
        return;
      } else if (item?.poll_type === 1 && shouldShowVotes) {
        alert('Already voted ==');
        return;
      }

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
          console.log('isSelected ===', isSelected);

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
          if (selectedPolls.length === item?.multiple_select_no) {
            return;
          }
          break;
        }
        case 1: {
          if (selectedPolls.length == item?.multiple_select_no) {
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
      setShouldShowVotes(true);
    } catch (error) {
      console.log('error at poll submission', error);
    }
  }

  const stringManipulation = () => {
    const multipleSelectNo = item?.multiple_select_no;
    switch (item?.multiple_select_state) {
      case POLL_MULTIPLE_STATE_EXACTLY: {
        return `*Select exactly ${multipleSelectNo} options.`;
      }

      case POLL_MULTIPLE_STATE_MAX: {
        return `*Select at most ${multipleSelectNo} options.`;
      }

      case POLL_MULTIPLE_STATE_LEAST: {
        return `*Select at least ${multipleSelectNo} options.`;
      }

      default: {
        return '';
      }
    }
  };

  // readonly props consumed by UI component
  let props: any = {
    text: item?.answer,
    votes: pollVoteCount,
    optionArr: pollsArr,
    pollTypeText: item?.poll_type_text,
    submitTypeText: item?.submit_type_text,
    addOptionInputField: addOptionInputField,
    shouldShowSubmitPollButton: shouldShowSubmitPollButton,
    selectedPolls: selectedPolls,
    showSelected: showSelected,
    allowAddOption: allowAddOption,
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
    isIncluded: isIncluded,
    multipleSelectNo: item?.multiple_select_no,
    multipleSelectState: item?.multiple_select_state,
    showResultsButton: showResultsButton,
    pollType: item?.poll_type,
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
        openKeyboard={openKeyboard}
        longPressOpenKeyboard={longPressOpenKeyboard}
        stringManipulation={stringManipulation}
        resetShowResult={resetShowResult}
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
  isIncluded,
  openKeyboard,
  longPressOpenKeyboard,
  multipleSelectNo,
  multipleSelectState,
  stringManipulation,
  showResultsButton,
  resetShowResult,
  pollType,
}: any) => {
  return (
    <View>
      {isIncluded ? (
        <TouchableOpacity
          onLongPress={() => {
            longPressOpenKeyboard();
            // alert('sdjn');
          }}
          onPress={() => {
            openKeyboard();
            // alert('ryayy');
          }}
          style={styles.selectedItem}
        />
      ) : null}
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

        {multipleSelectNo > 1 ? (
          <Text style={[styles.smallText, styles.greyColor, {marginTop: 5}]}>
            {stringManipulation()}
          </Text>
        ) : null}
      </View>

      {/* Poll Options*/}
      <View style={[styles.extraMarginSpace, styles.gap10]}>
        {optionArr?.map((element: any, index: any) => {
          let isSelected = selectedPolls.includes(index);
          let voteCount = element?.no_votes;
          return (
            <View key={element?.id} style={styles.gap}>
              <Pressable
                onLongPress={() => {
                  longPressOpenKeyboard();
                }}
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

                  {isSelected ? (
                    <View style={styles.selected}>
                      <Image
                        source={require('../../assets/images/white_tick3x.png')}
                        style={styles.smallIcon}
                      />
                    </View>
                  ) : null}
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
            onLongPress={() => {
              longPressOpenKeyboard();
            }}
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
      {isPollEnded && multipleSelectNo > 1 && !shouldShowVotes ? (
        <View style={styles.marginSpace}>
          <TouchableOpacity
            onLongPress={() => {
              longPressOpenKeyboard();
            }}
            onPress={() => {
              if (shouldShowSubmitPollButton) {
                submitPoll();
              }
            }}
            style={[
              styles.submitVoteButton,
              styles.alignRow,
              !shouldShowSubmitPollButton ? styles.greyBorder : null,
              {backgroundColor: styles.whiteColor.color},
              hue ? {backgroundColor: `hsl(${hue}, 47%, 31%)`} : null,
            ]}>
            <Image
              style={[
                styles.editIcon,
                !shouldShowSubmitPollButton
                  ? {tintColor: styles.greyColor.color}
                  : null,
              ]}
              source={require('../../assets/images/submit_click3x.png')}
            />
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

      {/* Edit Poll button */}
      {isPollEnded &&
      multipleSelectNo > 1 &&
      shouldShowVotes &&
      pollType === 1 ? (
        <TouchableOpacity
          onLongPress={() => {
            longPressOpenKeyboard();
          }}
          onPress={() => {
            resetShowResult();
          }}
          style={[
            styles.submitVoteButton,
            styles.alignRow,
            styles.justifyCenter,
            {backgroundColor: styles.whiteColor.color, marginTop: 10},
            hue ? {backgroundColor: `hsl(${hue}, 47%, 31%)`} : null,
          ]}>
          <Image
            style={[styles.editIcon]}
            source={require('../../assets/images/edit_icon3x.png')}
          />
          <Text style={[styles.textAlignCenter, styles.smallTextMedium]}>
            EDIT POLL
          </Text>
        </TouchableOpacity>
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
            Enter an option that you think is missing in this poll. This can not
            be undone.
          </Text>
        </View>
        <View style={styles.extraMarginSpace}>
          <TextInput
            value={addOptionInputField}
            onChangeText={setAddOptionInputField}
            placeholder={'Type new option'}
            placeholderTextColor="#c5c5c5"
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
