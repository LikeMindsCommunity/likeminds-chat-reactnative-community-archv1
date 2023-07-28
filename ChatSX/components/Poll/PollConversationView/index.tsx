import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../../../store';
import {POLL_RESULT} from '../../../constants/Screens';
import {SHOW_TOAST} from '../../../store/types/types';
import {firebaseConversation} from '../../../store/actions/chatroom';
import {myClient} from '../../../..';
import {
  ANONYMOUS_POLL_SUB_TITLE,
  ANONYMOUS_POLL_TITLE,
  POLL_ENDED_WARNING,
  POLL_MULTIPLE_STATE_EXACTLY,
  POLL_MULTIPLE_STATE_LEAST,
  POLL_MULTIPLE_STATE_MAX,
  POLL_SUBMITTED_SUCCESSFULLY,
} from '../../../constants/Strings';
import moment from 'moment';
import PollConversationUI from '../PollConversationUI';
import AnonymousPollModal from '../../../customModals/AnonymousPoll';
import AddOptionsModal from '../../../customModals/AddOptionModal';
import {
  PollConversationViewProps,
  PollConversationViewState,
} from '../../../Models/PollModels';

const PollConversationView = ({
  navigation,
  item,
  isIncluded,
  openKeyboard,
  longPressOpenKeyboard,
}: PollConversationViewProps) => {
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
            dispatch({
              type: SHOW_TOAST,
              body: {
                isToast: true,
                msg: `'You can select max ${item?.multiple_select_no} options. Unselect an option or submit your vote now'`,
              },
            });
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
            dispatch({
              type: SHOW_TOAST,
              body: {
                isToast: true,
                msg: `'You can select max ${item?.multiple_select_no} options. Unselect an option or submit your vote now'`,
              },
            });
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
      // process error
    }
  }

  // this function used we interact with poll options
  async function setSelectedPollOptions(pollIndex: any) {
    if (Date.now() > item?.expiry_time) {
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: POLL_ENDED_WARNING},
      });
      return;
    }
    const newSelectedPolls = [...selectedPolls];
    const isPollIndexIncluded = newSelectedPolls.includes(pollIndex);

    if (isPollIndexIncluded) {
      // if poll item is already selected
      const isSelected = item?.polls?.some((poll: any) => {
        return poll?.is_selected;
      });
      const selectedIndex = newSelectedPolls.findIndex(
        index => index === pollIndex,
      );
      newSelectedPolls.splice(selectedIndex, 1);
    } else {
      const isSelected = pollsArr?.some((poll: any) => {
        return poll?.is_selected;
      });

      // Already submitted poll condition
      if (isSelected && item?.poll_type === 0) {
        return;
      } else if (item?.poll_type === 1 && shouldShowVotes) {
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
          dispatch({
            type: SHOW_TOAST,
            body: {isToast: true, msg: POLL_SUBMITTED_SUCCESSFULLY},
          });
        } else {
          // for instant poll selection only for once

          // if not selected
          if (!isSelected) {
            const pollSubmissionCall = await myClient.submitPoll({
              conversationId: item?.id,
              polls: [item?.polls[pollIndex]],
            });
            await reloadConversation();
            dispatch({
              type: SHOW_TOAST,
              body: {isToast: true, msg: POLL_SUBMITTED_SUCCESSFULLY},
            });
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
      dispatch({
        type: SHOW_TOAST,
        body: {isToast: true, msg: POLL_SUBMITTED_SUCCESSFULLY},
      });
    } catch (error) {
      // process error
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
  let props: PollConversationViewState = {
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

export default PollConversationView;
