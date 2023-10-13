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
