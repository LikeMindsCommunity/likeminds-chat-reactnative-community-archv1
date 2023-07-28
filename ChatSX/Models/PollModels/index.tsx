export interface CreatePoll {
  navigation: any;
  route: any;
}

export interface CreatePollStateProps {
  hue?: number;
  show: boolean;
  date: any;
  mode: any;
  userCanVoteForArr: string[];
  showAdvancedOption: boolean;
  formatedDateTime: string;
  addOptionsEnabled: boolean;
  anonymousPollEnabled: boolean;
  liveResultsEnabled: boolean;
  userVoteFor: number;
  voteAllowedPerUser: number;
  question: string;
  optionsArray: Array<{id: string; text: string}>;
  userVoteForOptionsArrValue: any; // Considering creating a specific type for this property
  isSelectOptionModal: boolean;
  isActionAlertModalVisible: boolean;
  timeZoneOffsetInMinutes: number;
}

// Functions to handle user interactions
export interface CreatePollCallbacks {
  onChange: (event: any, selectedValue: any) => void;
  showDatePicker: () => void;
  handleQuestion: (val: string) => void;
  handleShowAdvanceOption: () => void;
  handleAddOptions: (val: boolean) => void;
  handleAnonymousPoll: (val: boolean) => void;
  handleLiveResults: (val: boolean) => void;
  handleInputOptionsChangeFunction: (index: any, value: any) => void;
  removeAnOption: (index: any) => void;
  addNewOption: () => void;
  postPoll: () => void;
  hideActionModal: () => void;
  hideSelectOptionModal: () => void;
  handleOnSelect: (val: number) => void;
  handleOnSelectOption: (val: number) => void;
  handleOpenActionModal: () => void;
  handleOpenOptionModal: () => void;
  resetDateTimePicker: () => void;
}

export interface Poll {
  id: string;
  is_selected: boolean;
  percentage: number;
  no_votes: number;
}

export interface PollConversationViewProps {
  navigation: any;
  item: any;
  isIncluded: boolean;
  openKeyboard: () => void;
  longPressOpenKeyboard: () => void;
}

export interface PollConversationViewState {
  hue?: number;
  text: string; // Assuming it's a string, update the type if necessary
  votes: number;
  optionArr: Poll[];
  pollTypeText: string;
  submitTypeText: string;
  addOptionInputField: string;
  shouldShowSubmitPollButton: boolean;
  selectedPolls: number[];
  showSelected: boolean;
  allowAddOption: boolean;
  shouldShowVotes: boolean;
  hasPollEnded: boolean;
  expiryTime: string;
  toShowResults: boolean;
  member: any;
  user: any;
  isEdited: boolean;
  createdAt: string;
  pollAnswerText: string;
  isPollEnded: boolean;
  isIncluded: boolean;
  multipleSelectNo?: any;
  multipleSelectState?: number;
  showResultsButton: boolean;
  pollType: number;
}

export interface PollConversationViewCallbacks {
  onNavigate: (val: string) => void;
  setSelectedPollOptions: (pollIndex: any) => void;
  addPollOption: () => void;
  submitPoll: () => void;
  setShowSelected: (show: boolean) => void;
  setIsAddPollOptionModalVisible: (visible: boolean) => void;
  setAddOptionInputField: (inputField: string) => void;
  openKeyboard: () => void;
  longPressOpenKeyboard: () => void;
  stringManipulation: () => string;
  resetShowResult: () => void;
}

export declare type CreatePollProps = CreatePollStateProps &
  CreatePollCallbacks;

export declare type PollConversationUIProps = PollConversationViewState &
  PollConversationViewCallbacks;
