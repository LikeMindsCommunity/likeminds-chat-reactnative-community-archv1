export interface Question {
  canAddOptions: boolean;
  communityId?: number;
  field?: boolean;
  helpText?: string;
  id?: number;
  isAnswerEditable: boolean;
  isCompulsory?: boolean;
  isHidden?: boolean;
  optional: boolean;
  questionTitle: string;
  rank: number;
  state: number;
  tag: null;
  value?: string;
  memberId?: string;
  directoryFields?: boolean;
  imageUrl?: string;
  questionChangeState?: number;
}
