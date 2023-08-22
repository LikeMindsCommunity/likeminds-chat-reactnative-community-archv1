import { Member } from "./Member";

export interface Reaction {
  member?: Member;
  reaction: string;
}
