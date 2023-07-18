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
} from 'react-native';
import React, {useState} from 'react';
import {styles} from './styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import {DATE_TEXT, DATE_TIME_TEXT, TIME_TEXT} from '../../constants/Strings';

const CreatePollModal = ({pollModalVisible, setPollModalVisible}: any) => {
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
              <CreatePollScreen handleModalClose={handleModalClose} />
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default CreatePollModal;

const CreatePollScreen = ({handleModalClose}: any) => {
  const [showAdvancedOption, setShowAdvancedOption] = useState(false);
  const [addOptionsEnabled, setAddOptionsEnabled] = useState(false);
  const [anonymousPollEnabled, setAnonymousPollEnabled] = useState(false);
  const [liveResultsEnabled, setLiveResultsEnabled] = useState(false);
  const [userVoteFor, setUserVoteFor] = useState('Exactly');
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('');
  const [show, setShow] = useState(false);
  const [time, setTime] = useState(new Date());

  const formatDate = (date: any, time: any) => {
    return `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()} ${time.getHours()}:${time.getMinutes()}`;
  };

  const onChange = (event: any, selectedValue: any) => {
    const isIOS = Platform.OS === 'ios';
    const newDate = new Date();

    // iOS DateTime Picker logic
    if (isIOS) {
      if (mode === DATE_TEXT) {
        const currentDate = selectedValue || newDate;
        setDate(currentDate);
        setMode(TIME_TEXT);
        setShow(true); // to show the picker again in time mode
      } else if (mode === TIME_TEXT) {
        const selectedTime = selectedValue || newDate;
        setTime(selectedTime);
        setMode('');
      } else {
        setShow(false);
      }
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

  const showMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatePicker = () => {
    showMode(DATE_TEXT);
  };

  const showTimePicker = () => {
    showMode(TIME_TEXT);
  };

  const showDateTimePicker = () => {
    showMode(DATE_TIME_TEXT);
  };

  const handleShowAdvanceOption = (val: boolean) => {
    setShowAdvancedOption(!showAdvancedOption);
  };

  const handleAddOptions = (val: boolean) => {
    setAddOptionsEnabled(val);
  };

  const handleAnonymousPoll = (val: boolean) => {
    setAnonymousPollEnabled(val);
  };

  const handleLiveResults = (val: boolean) => {
    setLiveResultsEnabled(val);
  };

  const handleUserVoteFor = (val: string) => {
    setUserVoteFor(val);
  };

  return (
    <CreatePollUI
      show={show}
      date={date}
      mode={mode}
      onChange={onChange}
      // hue={150}
      showDatePicker={showDatePicker}
      showAdvancedOption={showAdvancedOption}
      formatedDateTime={formatDate(date, time)}
      addOptionsEnabled={addOptionsEnabled}
      anonymousPollEnabled={anonymousPollEnabled}
      liveResultsEnabled={liveResultsEnabled}
      userVoteFor={userVoteFor}
      handleShowAdvanceOption={handleShowAdvanceOption}
      handleAddOptions={handleAddOptions}
      handleAnonymousPoll={handleAnonymousPoll}
      handleLiveResults={handleLiveResults}
      handleUserVoteFor={handleUserVoteFor}
      onCancel={handleModalClose}
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
  showTimePicker,
  showDateTimePicker,
  showAdvancedOption,
  formatedDateTime,
  addOptionsEnabled,
  anonymousPollEnabled,
  liveResultsEnabled,
  handleShowAdvanceOption,
  userVoteFor,
  handleAddOptions,
  handleAnonymousPoll,
  handleLiveResults,
  handleUserVoteFor,
  onCancel,
}: any) => {
  return (
    <View>
      {/* Header */}
      <View style={[styles.alignRow, styles.header]}>
        <TouchableOpacity onPress={onCancel} style={styles.viewStyle}>
          <Text
            style={[
              styles.font,
              hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <View style={[styles.viewStyle]}>
          <Text
            style={[styles.font, styles.newPollText, {textAlign: 'center'}]}>
            New Poll
          </Text>
        </View>
        <View style={styles.viewStyle} />
      </View>

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
            placeholder={'Which is the best design tool that you have used?'}
            style={[styles.font, styles.blackColor]}
            placeholderTextColor="#aaa"
            multiline
          />
        </View>
      </View>

      {/* Answers options */}
      <View style={styles.answerOptions}>
        <View>
          <Text
            style={[
              styles.font,
              hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            Answer options
          </Text>
        </View>
        <View style={styles.question}>
          <TextInput
            placeholder={'Option'}
            style={[styles.font, styles.option, styles.blackColor]}
            placeholderTextColor="#aaa"
          />
          <TextInput
            placeholder={'Option'}
            style={[styles.font, styles.option, styles.blackColor]}
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={[styles.alignRow]}>
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
        </View>
      </View>

      {/* Poll expire Time and Date selection */}
      <View style={styles.answerOptions}>
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
                timeZoneOffsetInMinutes={0}
                value={date}
                mode={mode}
                is24Hour={false}
                display="default"
                onChange={onChange}
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
        <View style={styles.answerOptions}>
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
        </View>
      ) : null}

      {/* Post button */}
      <TouchableOpacity
        style={[
          styles.extraMarginSpace,
          styles.postButton,
          hue ? {backgroundColor: `hsl(${hue}, 53%, 15%)`} : null,
        ]}>
        <Text style={[styles.font, styles.whiteColor]}>POST</Text>
      </TouchableOpacity>
    </View>
  );
};

const PollConversationView = () => {
  return (
    <View>
      <PollConversationUI />
      {/* {true ? <AddOptionsModal /> : null} */}
    </View>
  );
};

const PollConversationUI = ({hue, votes = 1}: any) => {
  return (
    <View>
      {/* Poll heading */}
      <View style={[styles.alignRow, styles.gap]}>
        <Text style={[styles.smallText, styles.greyColor]}>Instant Poll</Text>
        <Text
          style={[styles.smallText, styles.greyColor]}>{`• Open Voting`}</Text>
      </View>

      {/* Poll question */}
      <View style={styles.extraMarginSpace}>
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

        <Text style={[styles.text, styles.blackColor, styles.marginSpace]}>
          Which is the best design tool you have used?
        </Text>
      </View>

      {/* Poll Options*/}
      <View style={[styles.extraMarginSpace, styles.gap10]}>
        <Pressable
          style={({pressed}) => [
            styles.pollButton,
            {opacity: pressed ? 0.5 : 1},
            hue ? {borderColor: `hsl(${hue}, 47%, 31%)`} : null,
          ]}>
          <View
            style={[
              styles.pollButtonBackground,
              votes > 0
                ? {
                    width: '80%',
                    backgroundColor: hue
                      ? `hsl(${hue}, 60%, 85%)`
                      : `hsl(222, 60%, 85%)`,
                  }
                : null,
            ]}>
            <Text style={[styles.text, styles.blackColor]}>Sketch</Text>
          </View>
        </Pressable>
        <Pressable
          style={({pressed}) => [
            styles.pollButton,
            {opacity: pressed ? 0.5 : 1},
            hue ? {borderColor: `hsl(${hue}, 47%, 31%)`} : null,
          ]}>
          <View style={[styles.pollButtonBackground]}>
            <Text style={[styles.text, styles.blackColor]}>Adobe</Text>
          </View>
        </Pressable>
        <Pressable
          style={({pressed}) => [
            styles.pollButton,
            {opacity: pressed ? 0.5 : 1},
            hue ? {borderColor: `hsl(${hue}, 47%, 31%)`} : null,
          ]}>
          <View style={[styles.pollButtonBackground]}>
            <Text style={[styles.text, styles.blackColor]}>Figma</Text>
          </View>
        </Pressable>
      </View>

      {/* Add more options button */}
      <View style={[styles.extraMarginSpace]}>
        <Pressable
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

      <View>
        <Text
          style={[
            styles.smallText,
            styles.marginSpace,
            hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
          ]}>
          1 person voted on this poll
        </Text>
      </View>
    </View>
  );
};

const AddOptionsModal = ({
  addOptionsModalVisible = true,
  setAddOptionsVisible,
}: any) => {
  const handleModalClose = () => {
    setAddOptionsVisible(false);
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addOptionsModalVisible}
      onRequestClose={() => {
        setAddOptionsVisible(!addOptionsModalVisible);
      }}>
      <Pressable style={styles.centeredView} onPress={handleModalClose}>
        <View style={styles.addOptionsModalViewParent}>
          <Pressable onPress={() => {}} style={[styles.modalView]}>
            <View style={styles.alignModalElements}>
              <AddOptionUI />
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const AddOptionUI = ({hue, value, setValue}: any) => {
  return (
    <View>
      <View style={styles.padding20}>
        <View style={[{alignSelf: 'flex-end'}]}>
          <Image
            style={[styles.pollIcon, {tintColor: styles.blackColor.color}]}
            source={require('../../assets/images/cross_icon3x.png')}
          />
        </View>
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
            value={value}
            onChangeText={setValue}
            placeholder={'Type new option'}
            placeholderTextColor="#aaa"
            style={styles.textInput}
          />
        </View>
        <View style={styles.extraMarginSpace}>
          <TouchableOpacity
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
