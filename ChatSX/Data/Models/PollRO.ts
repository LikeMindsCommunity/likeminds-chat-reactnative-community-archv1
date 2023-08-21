import {
  MEMBER_RO,
  OPTIONAL_BOOLEAN,
  OPTIONAL_FLOAT,
  OPTIONAL_INT,
  OPTIONAL_STRING,
  POLL_RO,
  STRING,
} from "../constants";
import { MemberRO } from "./MemberRO";
import Realm from "realm";

export class PollRO extends Realm.Object<PollRO> {
  id!: string;
  text!: string;
  subText?: string | null;
  isSelected?: boolean | null;
  percentage?: number | null;
  noVotes?: number | null;
  member?: MemberRO | null;

  static schema: Realm.ObjectSchema = {
    name: POLL_RO,
    embedded: true,
    properties: {
      id: STRING,
      text: STRING,
      subText: OPTIONAL_STRING,
      isSelected: OPTIONAL_BOOLEAN,
      percentage: OPTIONAL_FLOAT,
      noVotes: OPTIONAL_INT,
      member: MEMBER_RO,
    },
  };
}
