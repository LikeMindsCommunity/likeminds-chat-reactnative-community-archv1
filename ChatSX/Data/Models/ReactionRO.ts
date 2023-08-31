import { OPTIONAL_MEMBER_RO, REACTION_RO, STRING } from "../Constants";
import { MemberRO } from "./MemberRO";
import Realm from "realm";

export class ReactionRO extends Realm.Object<ReactionRO> {
  member?: MemberRO | null;
  reaction!: string;

  static schema: Realm.ObjectSchema = {
    name: REACTION_RO,
    embedded: true,
    properties: {
      member: OPTIONAL_MEMBER_RO,
      reaction: STRING,
    },
  };
}
