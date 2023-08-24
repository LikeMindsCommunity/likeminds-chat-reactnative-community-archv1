import {AttachmentRO} from '../Models/AttachmentRO';
import {ChatroomRO} from '../Models/ChatroomRO';
import {CommunityRO} from '../Models/CommunityRO';
import {ConversationRO} from '../Models/ConversationRO';
import {LastConversationRO} from '../Models/LastConversationRO';
import {MemberRO} from '../Models/MemberRO';
import {PollRO} from '../Models/PollRO';
import {ReactionRO} from '../Models/ReactionRO';
import {
  convertToChatroomRO,
  convertCommunity,
  convertToMemberRO,
  convertToLastConversationRO,
  convertToConversationRO,
  convertToPollRO,
  convertToAttachmentRO,
} from './ROConverter';
import Db from './db';
import Realm from 'realm';

export function saveCommunityData(communityData: any) {
  // let community = convertCommunity(communityData);
  // console.log('community inside save community ====>>', community);
  return Realm.open(Db.getInstance()).then(realm => {
    realm.write(() => {
      let community = convertCommunity(communityData);
      realm.create(CommunityRO.schema.name, community, Realm.UpdateMode.All);
    });
    // realm.close(); // Close the Realm instance after the write operation
  });
}

// export function saveChatroomData(
//   chatroomData: any,
//   member: any,
//   lastConversation: any,
// ) {
//   // const chatroom = convertToChatroomRO(chatroomData, member);
//   console.log(
//     'lastConversation inside save lastConversation ====>>',
//     lastConversation,
//   );
//   return Realm.open(Db.getInstance()).then(realm => {
//     realm.write(() => {
//       const chatroom = convertToChatroomRO(
//         chatroomData,
//         member,
//         lastConversation,
//       );
//       realm.create(ChatroomRO.schema.name, chatroom, Realm.UpdateMode.All);
//     });
//     // realm.close(); // Close the Realm instance after the write operation
//   });
// }

// function insertOrUpdate<T extends Realm.Object>(realm: Realm, Schema: T, data: any) {
//   realm.create(Schema.schema.name, data, Realm.UpdateMode.All);
// }

function isPoll(state: number) {
  return state === 10;
}

export function saveChatroomResponse(
  data: any,
  chatrooms: any[],
  // loggedInUUID: string,
  communityId: string,
) {
  return Realm.open(Db.getInstance()).then(realm => {
    realm.write(() => {
      const community = data.communityMeta[communityId];
      if (!community) return;

      const communityRO = convertCommunity(community);

      if (!communityRO) return;
      // communityRO.relationshipNeeded = true;

      // insertOrUpdate(communityRO);
      realm.create(CommunityRO.schema.name, communityRO, Realm.UpdateMode.All);

      chatrooms.forEach(chatroom => {
        const creatorId = chatroom.userId;
        console.log('creatorIdSaveChatroom', creatorId);
        const creator = data.userMeta[creatorId?.toString()];
        console.log('creatorSaveChatroom ------>????', creator);
        if (!creator) return;
        const chatroomCreatorRO = convertToMemberRO(creator, communityId);
        console.log(
          'chatroomCreatorROSaveChatroom ------>????',
          chatroomCreatorRO,
        );
        if (!chatroomCreatorRO) return;
        // realmWrite.insertOrUpdate(chatroomCreatorRO);
        realm.create(
          MemberRO.schema.name,
          chatroomCreatorRO,
          Realm.UpdateMode.All,
        );

        const lastConversationId = chatroom.lastConversationId;
        const lastConversation =
          data.conversationMeta[lastConversationId?.toString()];

        if (!lastConversation) return;

        const lastConversationDeletedByMemberRO =
          lastConversation.deletedBy != null
            ? convertToMemberRO(
                data.userMeta[lastConversation.deletedBy],
                communityId,
              )
            : null;

        const lastConversationPolls = isPoll(lastConversation.state)
          ? (data.pollsMeta[lastConversationId?.toString()] || [])
              .sort((a: any, b: any) => a.id - b.id)
              .map((poll: any) => {
                const user = data.userMeta[poll.userId];
                return poll.toBuilder().member(user).build();
              })
          : [];

        const lastConversationAttachment =
          lastConversation.attachmentUploaded === true &&
          (lastConversation.attachmentCount || 0) > 0
            ? data.attachmentMeta[lastConversationId?.toString()]
            : [];

        console.log('Hello world!!!', lastConversation);

        const lastConversationCreatorId = lastConversation.userId;
        const lastConversationCreator =
          data.userMeta[lastConversationCreatorId?.toString()];
        console.log('Hello world', lastConversationCreator);
        if (!lastConversationCreator) return;

        const lastConversationCreatorRO = convertToMemberRO(
          lastConversationCreator,
          communityId,
        );

        console.log('Hello world 3', lastConversationCreatorRO);
        if (!lastConversationCreatorRO) return;

        const lastConversationRO = convertToLastConversationRO(
          // realm,
          lastConversation,
          lastConversationCreatorRO,
          chatroom?.id,
          lastConversationAttachment,
          lastConversationDeletedByMemberRO,
        );

        console.log('Hello world 4', lastConversation);

        if (!lastConversationRO) return;
        console.log('Hello world 5');

        // realmWrite.insertOrUpdate(lastConversationRO);
        realm.create(
          LastConversationRO.schema.name,
          lastConversationRO,
          Realm.UpdateMode.All,
        );
        // // realmWrite.insertOrUpdate(lastConversationCreatorRO);
        realm.create(
          MemberRO.schema.name,
          lastConversationCreatorRO,
          Realm.UpdateMode.All,
        );

        console.log('Hello world 6');

        const lastSeenConversationId = chatroom.lastSeenConversationId;
        if (lastSeenConversationId) {
          const lastSeenConversation =
            data.conversationMeta[lastSeenConversationId?.toString()];
          const lastSeenConversationCreator =
            data.userMeta[lastSeenConversation?.memberId?.toString()];
          const lastSeenConversationCreatorRO = convertToMemberRO(
            lastSeenConversationCreator,
            communityId,
          );

          const lastSeenConversationDeletedByMemberRO =
            lastSeenConversation?.deletedBy != null
              ? convertToMemberRO(
                  data.userMeta[lastSeenConversation.deletedBy],
                  communityId,
                )
              : null;

          const lastSeenConversationPolls = isPoll(
            lastSeenConversation?.state || 0,
          )
            ? (data.convPollsMeta[lastSeenConversationId?.toString()] || [])
                .sort((a: any, b: any) => a.id - b.id)
                .map((poll: any) => {
                  const user = data.userMeta[poll.userId];
                  return poll.toBuilder().member(user).build();
                })
            : [];

          const lastSeenConversationAttachments =
            lastSeenConversation?.attachmentUploaded === true &&
            (lastSeenConversation.attachmentCount || 0) > 0
              ? data.convAttachmentsMeta[lastSeenConversationId?.toString()]
              : [];
          console.log('attachmentsChatroom', lastSeenConversationAttachments);

          const lastSeenConversationRO = convertToConversationRO(
            lastSeenConversation,
            lastSeenConversationCreatorRO,
            lastSeenConversationAttachments,
            lastSeenConversationPolls,
          );
          if (lastSeenConversationRO) {
            realm.create(
              LastConversationRO.schema.name,
              lastSeenConversationRO,
              Realm.UpdateMode.All,
            );
            // realmWrite.insertOrUpdate(lastSeenConversationRO);
          }
          if (lastSeenConversationCreatorRO) {
            realm.create(
              MemberRO.schema.name,
              lastSeenConversationCreatorRO,
              Realm.UpdateMode.All,
            );
            // realmWrite.insertOrUpdate(lastSeenConversationCreatorRO);
          }
        }

        const chatroomRO = convertToChatroomRO(
          chatroom,
          chatroomCreatorRO,
          lastConversationRO, //its of type LastConversationRO
        );
        console.log('chatroomRO?? #######', chatroomRO);

        if (chatroomRO) {
          chatroomRO.relationshipNeeded = true;
          realm.create(
            ChatroomRO.schema.name,
            chatroomRO,
            Realm.UpdateMode.All,
          );
          // realmWrite.insertOrUpdate(chatroomRO);
        }
        console.log('doneWithChatroomSavingToLocalDB');
      });
    });
  });
}

export function saveConversationData(
  data: any,
  chatroomData: any[],
  conversationData: any[],
  communityId: any,
) {
  return Realm.open(Db.getInstance()).then(realm => {
    realm.write(() => {
      // save community
      const community = data.communityMeta[communityId];
      if (!community) return;

      const communityRO = convertCommunity(community);
      if (!communityRO) return;

      realm.create(CommunityRO.schema.name, communityRO, Realm.UpdateMode.All);

      // save chatroom
      chatroomData.forEach(chatroom => {
        const creatorId = chatroom.userId;
        console.log('creatorIdsaveConversationData', creatorId);
        const creator = data.userMeta[creatorId?.toString()];
        console.log('creatorsaveConversationData ------>????', creator);
        if (!creator) return;
        const chatroomCreatorRO = convertToMemberRO(creator, communityId);
        console.log(
          'chatroomCreatorROsaveConversationData ------>????',
          chatroomCreatorRO,
        );
        if (!chatroomCreatorRO) return;
        // realmWrite.insertOrUpdate(chatroomCreatorRO);
        realm.create(
          MemberRO.schema.name,
          chatroomCreatorRO,
          Realm.UpdateMode.All,
        );

        console.log('created1');

        console.log('conversationDataSaveConversation', conversationData);

        // save reactions on chatroom

        // save conversations
      });

      // save conversations
      for (const entryId in conversationData) {
        if (conversationData.hasOwnProperty(entryId)) {
          const conversation = conversationData[entryId];
          // save conversation creator
          const creatorId = conversation?.userId;
          console.log('creatorIdSaveConversation', creatorId);
          const creator = data.userMeta[creatorId?.toString()];
          if (!creator) return;
          const chatroomCreatorRO = convertToMemberRO(creator, communityId);
          if (!chatroomCreatorRO) return;
          realm.create(
            MemberRO.schema.name,
            chatroomCreatorRO,
            Realm.UpdateMode.All,
          );

          console.log('created2');

          // save reactions on conversations
          const conversationReaction =
            conversation.hasReactions === true
              ? data.convReactionsMeta[conversation?.id?.toString()]
              : [];

          // save polls
          const conversationState = conversation?.state;
          const conversationPolls = isPoll(conversationState?.state || 0)
            ? (data.convPollsMeta[conversation?.id?.toString()] || [])
                .sort((a: any, b: any) => a.id - b.id)
                .map((poll: any) => {
                  const user = data.userMeta[poll.userId];
                  return poll.toBuilder().member(user).build();
                })
            : [];

          // Convert polls to PollsRO type
          const conversationPollsRO = convertToPollRO(
            conversationPolls,
            communityId,
          );

          // save attachments
          console.log(
            'conversationIdFOrAttachmentInSaveConv',
            conversation?.id,
          );
          const conversationAttachment =
            conversation.attachmentUploaded === true &&
            (conversation.attachmentCount || 0) > 0
              ? data.convAttachmentsMeta[conversation?.id?.toString()]
              : [];

          console.log('data.convAttachmentsMeta', data.convAttachmentsMeta);
          console.log('attachmentsConversation', conversationAttachment);
          // convert Attachments to AttachmentsRO type
          const conversationAttachmentRO = convertToAttachmentRO(
            conversationAttachment,
          );

          const conversationRO = convertToConversationRO(
            conversation,
            chatroomCreatorRO,
            conversationAttachment,
            conversationPolls,
            conversationReaction,
          );
          console.log('conversationROSaveConversation', conversationRO);
          if (conversationRO) {
            // conversationRO.relationshipNeeded = true;
            realm.create(
              ConversationRO.schema.name,
              conversationRO,
              Realm.UpdateMode.All,
            );
            // realmWrite.insertOrUpdate(chatroomRO);
          }
          console.log('created5');
        }
      }
    });
    // realm.close(); // Close the Realm instance after the write operation
  });
}

export async function getChatroomData() {
  const realm = await Realm.open(Db.getInstance());
  const chatrooms = realm.objects(ChatroomRO.schema.name);
  console.log('chatrooms ====> <<<<<', chatrooms);
  const chatroomObject = chatrooms.map(chatroom => {
    const stringifiedChatroom = JSON.stringify(chatroom);
    return {
      ...JSON.parse(stringifiedChatroom),
    };
  });
  // realm.close();
  return chatroomObject;
}

export async function getCommunityData() {
  const realm = await Realm.open(Db.getInstance());
  const communities = realm.objects(CommunityRO.schema.name);
  console.log('commmuniter ====> <<<<<', communities[0]);
  const communityObject = communities.map(community => {
    const stringifiedCommunity = JSON.stringify(community);
    return {
      ...JSON.parse(stringifiedCommunity),
    };
  });

  // realm.close(); // Close the Realm instance after reading data

  return communityObject;
}

export async function getConversationData() {
  const realm = await Realm.open(Db.getInstance());
  const conversations = realm.objects(ConversationRO.schema.name);
  console.log('conversations ====> <<<<<', conversations);
  const coonversationObject = conversations.map(conversation => {
    const stringifiedConversation = JSON.stringify(conversation);
    return {
      ...JSON.parse(stringifiedConversation),
    };
  });

  // realm.close(); // Close the Realm instance after reading data

  return coonversationObject;
}
