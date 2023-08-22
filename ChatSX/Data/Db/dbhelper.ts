import {AttachmentRO} from '../Models/AttachmentRO';
import {ChatroomRO} from '../Models/ChatroomRO';
import {CommunityRO} from '../Models/CommunityRO';
import {ConversationRO} from '../Models/ConversationRO';
import {LastConversationRO} from '../Models/LastConversationRO';
import {MemberRO} from '../Models/MemberRO';
import {PollRO} from '../Models/PollRO';
import {ReactionRO} from '../Models/ReactionRO';
import {convertToChatroomRO, convertCommunity} from './ROConverter';
import Db from './db';
import Realm from 'realm';

export function saveCommunityData(communityData: any) {
  let community = convertCommunity(communityData);
  console.log('community inside save community ====>>', community);
  return Realm.open(Db.getInstance()).then(realm => {
    realm.write(() => {
      realm.create(CommunityRO.schema.name, community, Realm.UpdateMode.All);
    });
    realm.close(); // Close the Realm instance after the write operation
  });
}

export function saveChatroomData(chatroomData: any, member: any) {
  const chatroom = convertToChatroomRO(chatroomData, member);
  console.log('chatroom inside save Chatroom ====>>', chatroom);
  return Realm.open(Db.getInstance()).then(realm => {
    realm.write(() => {
      realm.create(ChatroomRO.schema.name, chatroom, Realm.UpdateMode.All);
    });
    realm.close(); // Close the Realm instance after the write operation
  });
}

export function saveConversationData(conversationData: any) {
  return Realm.open(Db.getInstance()).then(realm => {
    realm.write(() => {
      realm.create(
        ConversationRO.schema.name,
        conversationData,
        Realm.UpdateMode.All,
      );
    });
    realm.close(); // Close the Realm instance after the write operation
  });
}

export async function getCommunityData() {
  const realm = await Realm.open(Db.getInstance());
  const communities = realm.objects(CommunityRO.schema.name);

  const communityObject = communities.map(community => {
    const stringifiedCommunity = JSON.stringify(community);
    return {
      ...JSON.parse(stringifiedCommunity),
    };
  });

  realm.close(); // Close the Realm instance after reading data

  return communityObject;
}
