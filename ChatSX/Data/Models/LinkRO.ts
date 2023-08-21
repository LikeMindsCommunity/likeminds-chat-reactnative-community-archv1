import { LINK_RO, OPTIONAL_STRING, STRING } from "../constants";
import Realm from "realm";

export class LinkRO extends Realm.Object<LinkRO> {
  url!: string;
  chatroomId!: string;
  communityId!: string;
  title?: string | null;
  image?: string | null;
  description?: string | null;

  static schema: Realm.ObjectSchema = {
    name: LINK_RO,
    embedded: true,
    properties: {
      url: STRING,
      chatroomId: STRING,
      communityId: STRING,
      title: OPTIONAL_STRING,
      image: OPTIONAL_STRING,
      description: OPTIONAL_STRING,
    },
  };
}
