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
  return Realm.open(Db.getInstance()).then(realm => {
    realm.write(() => {
      let community = convertCommunity(communityData);
      realm.create(CommunityRO.schema.name, community, Realm.UpdateMode.All);
    });
    // realm.close(); // Close the Realm instance after the write operation
  });
}

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
        const creator = data.userMeta[creatorId?.toString()];
        if (!creator) return;
        const chatroomCreatorRO = convertToMemberRO(creator, communityId);
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

        const lastConversationCreatorId = lastConversation.userId;
        const lastConversationCreator =
          data.userMeta[lastConversationCreatorId?.toString()];
        if (!lastConversationCreator) return;

        const lastConversationCreatorRO = convertToMemberRO(
          lastConversationCreator,
          communityId,
        );

        const lastConvRO = convertToConversationRO(
          lastConversation,
          lastConversationCreatorRO,
          lastConversationAttachment,
          lastConversationPolls,
        );

        if (!lastConversationCreatorRO) return;

        const lastConversationRO = convertToLastConversationRO(
          lastConversation,
          lastConversationCreatorRO,
          chatroom?.id,
          lastConversationAttachment,
          lastConversationDeletedByMemberRO,
        );

        if (!lastConversationRO) return;

        // realmWrite.insertOrUpdate(lastConversationRO);
        realm.create(
          LastConversationRO.schema.name,
          lastConversationRO,
          Realm.UpdateMode.All,
        );
        // realmWrite.insertOrUpdate(lastConversationCreatorRO);
        realm.create(
          MemberRO.schema.name,
          lastConversationCreatorRO,
          Realm.UpdateMode.All,
        );

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
          lastConvRO,
          lastConversationRO, //its of type LastConversationRO
        );

        if (chatroomRO) {
          chatroomRO.relationshipNeeded = true;
          realm.create(
            ChatroomRO.schema.name,
            chatroomRO,
            Realm.UpdateMode.All,
          );
          // realmWrite.insertOrUpdate(chatroomRO);
        }
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
        const creator = data.userMeta[creatorId?.toString()];
        if (!creator) return;
        const chatroomCreatorRO = convertToMemberRO(creator, communityId);
        if (!chatroomCreatorRO) return;
        // realmWrite.insertOrUpdate(chatroomCreatorRO);
        realm.create(
          MemberRO.schema.name,
          chatroomCreatorRO,
          Realm.UpdateMode.All,
        );

        // save reactions on chatroom

        // save conversations
      });

      // save conversations
      for (const entryId in conversationData) {
        if (conversationData.hasOwnProperty(entryId)) {
          const conversation = conversationData[entryId];
          // save conversation creator
          const creatorId = conversation?.userId;
          const creator = data.userMeta[creatorId?.toString()];
          if (!creator) return;
          const chatroomCreatorRO = convertToMemberRO(creator, communityId);
          if (!chatroomCreatorRO) return;
          realm.create(
            MemberRO.schema.name,
            chatroomCreatorRO,
            Realm.UpdateMode.All,
          );

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

          // save attachments
          const conversationAttachment =
            conversation.attachmentsUploaded === true &&
            (conversation.attachmentCount || 0) > 0
              ? data.convAttachmentsMeta[conversation?.id?.toString()]
              : [];

          const conversationRO = convertToConversationRO(
            conversation,
            chatroomCreatorRO,
            conversationAttachment,
            conversationPolls,
            conversationReaction,
          );

          if (conversationRO) {
            // conversationRO.relationshipNeeded = true;
            realm.create(
              ConversationRO.schema.name,
              conversationRO,
              Realm.UpdateMode.All,
            );
            // realmWrite.insertOrUpdate(chatroomRO);
          }
        }
      }
    });
    // realm.close(); // Close the Realm instance after the write operation
  });
}

export async function getChatroomData() {
  const realm = await Realm.open(Db.getInstance());
  const chatrooms = realm.objects(ChatroomRO.schema.name);
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
  const coonversationObject = conversations.map(conversation => {
    const stringifiedConversation = JSON.stringify(conversation);
    return {
      ...JSON.parse(stringifiedConversation),
    };
  });

  // realm.close(); // Close the Realm instance after reading data

  return coonversationObject;
}
