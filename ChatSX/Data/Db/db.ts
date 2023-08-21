import Realm from 'realm';
import { ChatroomRO } from '../Models/ChatroomRO';
import { CommunityRO } from '../Models/CommunityRO';

export default class Db {
  private static instance: Realm;

  private constructor() {}

  static getInstance(): Realm {
    if (!Db.instance) {
      Db.instance = new Realm({ schema: [ChatroomRO, CommunityRO] });
    }
    return Db.instance;
  }

  static write(callback: (realm: Realm) => void) {
    const realm = Db.getInstance();
    try {
      realm.write(() => {
        callback(realm);
      });
    } catch (error) {
      console.error('Error during Realm write:', error);
    }
  }

  // Other methods like query, insert, etc.
}

