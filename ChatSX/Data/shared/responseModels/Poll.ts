import {Member} from './Member';

export interface Poll {
  id: string;
  text: string;
  isSelected?: boolean;
  percentage?: number;
  subText?: string;
  noVotes?: number;
  member?: Member;
  userId?: string;
}
