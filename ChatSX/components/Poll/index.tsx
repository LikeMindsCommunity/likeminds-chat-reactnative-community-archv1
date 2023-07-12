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

const PollModal = ({pollModalVisible, setPollModalVisible}: any) => {
  const handleModalClose = () => {
    setPollModalVisible(false);
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={pollModalVisible}
      onRequestClose={() => {
        setPollModalVisible(!pollModalVisible);
      }}>
      <Pressable style={styles.centeredView} onPress={handleModalClose}>
        <View style={styles.modalViewParent}>
          <Pressable onPress={() => {}} style={[styles.modalView]}>
            <View style={styles.alignModalElements}>
              <PollScreen />
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default PollModal;

const PollScreen = () => {
  const [showAdvancedOption, setShowAdvancedOption] = useState(false);
  const [addOptionsEnabled, setAddOptionsEnabled] = useState(false);
  const [anonymousPollEnabled, setAnonymousPollEnabled] = useState(false);
  const [liveResultsEnabled, setLiveResultsEnabled] = useState(false);
  const [userVoteFor, setUserVoteFor] = useState('Exactly');
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [time, setTime] = useState(new Date());

  const formatDate = (date: any, time: any) => {
    return `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()} ${time.getHours()}:${time.getMinutes()}`;
  };

  const onChange = (event: any, selectedValue: any) => {
    setShow(Platform.OS === 'ios');
    if (mode == 'date') {
      const currentDate = selectedValue || new Date();
      setDate(currentDate);
      setMode('time');
      setShow(Platform.OS !== 'ios'); // to show the picker again in time mode
    } else {
      const selectedTime = selectedValue || new Date();
      setTime(selectedTime);
      setShow(Platform.OS === 'ios');
      setMode('date');
    }
  };

  const showMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatePicker = () => {
    showMode('date');
  };

  const showTimePicker = () => {
    showMode('time');
  };

  const showDateTimePicker = () => {
    showMode('datetime');
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
    <PollUI
      show={show}
      date={date}
      mode={mode}
      onChange={onChange}
      hue={150}
      // showTimePicker={showTimePicker}
      showDatePicker={showDatePicker}
      showDateTimePicker={showDateTimePicker}
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
    />
  );
};

const PollUI = ({
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
}: any) => {
  return (
    <View>
      {/* Header */}
      <View style={[styles.alignRow, styles.header]}>
        <View style={styles.viewStyle}>
          <Text
            style={[
              styles.font,
              hue ? {color: `hsl(${hue}, 53%, 15%)`} : null,
            ]}>
            Cancel
          </Text>
        </View>
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
              if (Platform.OS !== 'ios') {
                showDateTimePicker();
              } else {
                showDatePicker();
              }
            }}>
            {!show ? (
              <Text style={[styles.font, styles.placeHolder]}>
                {'DD-MM-YYYY hh:mm'}
              </Text>
            ) : (
              <Text style={[styles.font, styles.blackColor]}>
                {formatedDateTime}
              </Text>
            )}
            {/* Date Time Picker */}
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                timeZoneOffsetInMinutes={0}
                value={date}
                mode={mode}
                is24Hour={true}
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

export {PollUI, PollScreen};
