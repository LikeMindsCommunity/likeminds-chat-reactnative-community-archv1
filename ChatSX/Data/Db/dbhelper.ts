import { AttachmentRO } from '../Models/AttachmentRO';
import {ChatroomRO} from '../Models/ChatroomRO';
import {CommunityRO} from '../Models/CommunityRO';
import {ConversationRO} from '../Models/ConversationRO';
import {LastConversationRO} from '../Models/LastConversationRO';
import {MemberRO} from '../Models/MemberRO';
import { PollRO } from '../Models/PollRO';
import {ReactionRO} from '../Models/ReactionRO';
import {convertCommunity} from './ROConverter';
import Db from './db';
import Realm from 'realm';

// class DbHelper {
//   static saveCommunityData(communityData: any) {
//     Db.write(realm => {
//       realm.create<CommunityRO>(
//         CommunityRO.schema.name,
//         communityData,
//         Realm.UpdateMode.All,
//       );
//     });
//   }

//   static saveChatroomData(chatroomData: any) {
//     Db.write(realm => {
//       realm.create<ChatroomRO>(
//         ChatroomRO.schema.name,
//         chatroomData,
//         Realm.UpdateMode.All,
//       );
//     });
//   }

//   static getCommunityData(): CommunityRO | null {
//     const realm = Db.getInstance(); // Assuming you have a method to get the Realm instance
//     const community = realm.objects<CommunityRO>(CommunityRO.schema.name)[0];
//     return community || null;
//   }

//   static getChatroomData(): ChatroomRO[] {
//     const realm = Db.getInstance();
//     const chatrooms = realm.objects<ChatroomRO>(ChatroomRO.schema.name);
//     return chatrooms.map(chatroom => chatroom);
//   }

//   // Other utility methods
// }

// export default DbHelper;

export function saveCommunityData(communityData: any) {
  let community = convertCommunity(communityData);
  return Realm.open({schema: [CommunityRO, ConversationRO, ChatroomRO]}).then(
    realm => {
      realm.write(() => {
        realm.create(CommunityRO.schema.name, community, Realm.UpdateMode.All);
      });
      realm.close(); // Close the Realm instance after the write operation
    },
  );
}

export function saveChatroomData(chatroomData: any) {

  return Realm.open({
    schema: [
      ChatroomRO,
      MemberRO,
      ConversationRO,
      LastConversationRO,
      ReactionRO,
    ],
  }).then(realm => {
    realm.write(() => {
      realm.create(ChatroomRO.schema.name, chatroomData, Realm.UpdateMode.All);
    });
    realm.close(); // Close the Realm instance after the write operation
  });
}

export function saveConversationData(conversationData: any) {
  
  return Realm.open({
    schema: [
      MemberRO,
      ConversationRO,
      ReactionRO,
      AttachmentRO,
      PollRO
    ],
  }).then(realm => {
    realm.write(() => {
      realm.create(ConversationRO.schema.name, conversationData, Realm.UpdateMode.All);
    });
    realm.close(); // Close the Realm instance after the write operation
  });
}

export function getCommunityData() {
  return Realm.open({schema: [CommunityRO]}).then(realm => {
    const communities = realm.objects(CommunityRO.schema.name);
    const communityArray = Array.from(communities); // Convert Realm collection to an array
    realm.close(); // Close the Realm instance after reading data
    return communityArray;
  });
}
