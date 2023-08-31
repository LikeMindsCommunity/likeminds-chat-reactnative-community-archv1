import { Member } from "./Member";

export interface Cohort {
  id?: number;
  totalMembers?: number;
  name?: string;
  members?: Member[];
}
