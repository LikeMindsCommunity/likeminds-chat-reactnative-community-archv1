import Realm from 'realm';
import {ChatroomRO} from '../Models/ChatroomRO';
import {CommunityRO} from '../Models/CommunityRO';
import {AppConfigRO} from '../Models/AppConfigRO';
import {ConversationRO} from '../Models/ConversationRO';
import {LastConversationRO} from '../Models/LastConversationRO';
import {LinkRO} from '../Models/LinkRO';
import {MemberRO} from '../Models/MemberRO';
import {PollRO} from '../Models/PollRO';
import {SDKClientInfoRO} from '../Models/SDKClientInfoRO';
import {UserRO} from '../Models/UserRO';
import {AttachmentMetaRO} from '../Models/AttachmentMetaRO';
import {AttachmentRO} from '../Models/AttachmentRO';
import {ReactionRO} from '../Models/ReactionRO';

export default class Db {
  private static instance: Realm;

  private constructor() {}
  private static realmConfig: Realm.Configuration = {
    schema: [
      AppConfigRO,
      AttachmentMetaRO,
      AttachmentRO,
      ChatroomRO,
      CommunityRO,
      ConversationRO,
      LastConversationRO,
      LinkRO,
      MemberRO,
      PollRO,
      ReactionRO,
      SDKClientInfoRO,
      UserRO,
    ], // Update with your actual models
    schemaVersion: 1, // Increment when you change the schema
    // onMigration: (oldRealm: Realm, newRealm: Realm) => {
    //   // Migration logic
    // },
    deleteRealmIfMigrationNeeded: false, // Set to true to delete the realm if schema needs migration
    // encryptionKey: new Int8Array(64), // Replace with your encryption key
    inMemory: false, // Set to true to create an in-memory realm
    readOnly: false, // Set to true for read-only access
    path: 'bundle.realm',
  };
  static getInstance(): Realm {
    if (!Db.instance) {
      Db.instance = new Realm(Db.realmConfig);
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
