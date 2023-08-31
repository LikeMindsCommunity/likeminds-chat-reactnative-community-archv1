import Realm from 'realm';
import {TIME_STAMP_RO, INT} from '../Constants';

export class TimeStampRO extends Realm.Object<TimeStampRO> {
  minTimeStamp!: number;
  maxTimeStamp!: number;

  static schema: Realm.ObjectSchema = {
    name: TIME_STAMP_RO,
    properties: {
      minTimeStamp: INT,
      maxTimeStamp: INT,
    },
  };
}
