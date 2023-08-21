import { ATTACHMENT_META_RO, OPTIONAL_INT } from "../constants";
import Realm from "realm";

export class AttachmentMetaRO extends Realm.Object<AttachmentMetaRO> {
  numberOfPage?: number | null;
  size?: number | null;
  duration?: number | null;

  static schema: Realm.ObjectSchema = {
    name: ATTACHMENT_META_RO,
    embedded: true,
    properties: {
      numberOfPage: OPTIONAL_INT,
      size: OPTIONAL_INT,
      duration: OPTIONAL_INT,
    },
  };
}
