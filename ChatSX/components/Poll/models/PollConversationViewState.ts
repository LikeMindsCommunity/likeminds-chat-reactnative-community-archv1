import {Poll} from './Poll';

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
