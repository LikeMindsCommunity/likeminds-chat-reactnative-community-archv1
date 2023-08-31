import {myClient} from '../../..';
import {getChatroom} from '../../store/actions/chatroom';
import {AttachmentRO} from '../Models/AttachmentRO';
import {ChatroomRO} from '../Models/ChatroomRO';
import {CommunityRO} from '../Models/CommunityRO';
import {ConversationRO} from '../Models/ConversationRO';
import {LastConversationRO} from '../Models/LastConversationRO';
import {MemberRO} from '../Models/MemberRO';
import {PollRO} from '../Models/PollRO';
import {ReactionRO} from '../Models/ReactionRO';
import {TimeStampRO} from '../Models/TimeStampRO';
import {
  convertToChatroomRO,
  convertCommunity,
  convertToMemberRO,
  convertToLastConversationRO,
  convertToConversationRO,
  convertToPollRO,
  convertToAttachmentRO,
  convertToTimeStampRO,
} from './ROConverter';
import Db from './db';
import Realm from 'realm';
import {useAppDispatch} from '../../../store';

// method to save the community data
export function saveCommunityData(communityData: any) {
  return Realm.open(Db.getInstance()).then(realm => {
    realm.write(() => {
      let community = convertCommunity(communityData);
      realm.create(CommunityRO.schema.name, community, Realm.UpdateMode.All);
    });

    //TODO
    // realm.close(); // Close the Realm instance after the write operation
  });
}

// method to check for poll
function isPoll(state: number) {
  return state === 10;
}

export async function saveTimeStamp(
  minTimeStamp: number,
  maxTimeStamp: number,
) {
  const realm = await Realm.open(Db.getInstance());
  realm.write(() => {
    const timeStampRO = convertToTimeStampRO(minTimeStamp, maxTimeStamp);
    if (timeStampRO) {
      realm.create(TimeStampRO.schema.name, timeStampRO, Realm.UpdateMode.All);
    }
  });
}

export async function updateTimeStamp(
  minTimeStamp: number,
  maxTimeStamp: number,
) {
  const realm = await Realm.open(Db.getInstance());
  realm.write(() => {
    let timeStampCurrent = realm.objects(TimeStampRO.schema.name)[0];
    // console.log('timeStampCurrentWrapper', timeStampCurrent.minTimeStamp);
    // const temp = JSON.stringify(timeStampCurrent);
    // let parsedTimeStamp = JSON.parse(temp);
    timeStampCurrent.minTimeStamp = minTimeStamp;
    timeStampCurrent.maxTimeStamp = maxTimeStamp;
    // timeStampCurrent = parsedTimeStamp;
    // console.log('parsedTimeStampWrapper', parsedTimeStamp);
    // console.log('timeStampCurrentWrapper123', timeStampCurrent);
  });
}

export async function getTimeStamp() {
  const realm = await Realm.open(Db.getInstance());
  const timeStamp = realm.objects(TimeStampRO.schema.name);
  return timeStamp;
}

// method to save chatroom data
export async function saveChatroomResponse(
  data: any,
  chatrooms: any[],
  communityId: string,
) {
  console.log('here');
  const realm = await Realm.open(Db.getInstance());
  console.log('here1');
  realm.write(() => {
    console.log('here2');
    const community = data.communityMeta[communityId];
    // console.log('community', community);
    if (!community) return;

    // console.log('community', community);

    const communityRO = convertCommunity(community);

    if (!communityRO) return;
    // console.log('communityRO', communityRO);
    realm.create(CommunityRO.schema.name, communityRO, Realm.UpdateMode.All);

    console.log('1');

    chatrooms.forEach(chatroom => {
      const creatorId = chatroom.userId;
      const creator = data.userMeta[creatorId?.toString()];
      // console.log('creator', creator);
      if (!creator) return;
      const chatroomCreatorRO = convertToMemberRO(creator, communityId);
      if (!chatroomCreatorRO) return;
      // console.log('chatroomCreatorRO', chatroomCreatorRO);

      // insert or update chatroomCreatorRO
      realm.create(
        MemberRO.schema.name,
        chatroomCreatorRO,
        Realm.UpdateMode.All,
      );
      console.log('2');

      // save lastConversation details
      const lastConversationId = chatroom.lastConversationId;
      const lastConversation =
        data.conversationMeta[lastConversationId?.toString()];
      // console.log('lastConversation', lastConversation);

      if (!lastConversation) return;

      const lastConversationDeletedByMemberRO =
        lastConversation.deletedBy != null
          ? convertToMemberRO(
              data.userMeta[lastConversation.deletedBy],
              communityId,
            )
          : null;
      // console.log(
      //   'lastConversationDeletedByMemberRO',
      //   lastConversationDeletedByMemberRO,
      // );

      // save lastConversation polls
      const lastConversationPolls = isPoll(lastConversation.state)
        ? (data.pollsMeta[lastConversationId?.toString()] || [])
            .sort((a: any, b: any) => a.id - b.id)
            .map((poll: any) => {
              const user = data.userMeta[poll.userId];
              return poll.toBuilder().member(user).build();
            })
        : [];
      // console.log('lastConversationPolls', lastConversationPolls);

      // save lastConversation attachments
      const lastConversationAttachment =
        lastConversation.attachmentUploaded === true &&
        (lastConversation.attachmentCount || 0) > 0
          ? data.attachmentMeta[lastConversationId?.toString()]
          : [];
      // console.log('lastConversationAttachment', lastConversationAttachment);

      const lastConversationCreatorId = lastConversation.userId;
      const lastConversationCreator =
        data.userMeta[lastConversationCreatorId?.toString()];
      if (!lastConversationCreator) return;
      // console.log('lastConversationCreator', lastConversationCreator);

      const lastConversationCreatorRO = convertToMemberRO(
        lastConversationCreator,
        communityId,
      );
      // console.log('lastConversationCreatorRO', lastConversationCreatorRO);

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

      console.log('11');
      if (!lastConversationRO) return;

      console.log('12');

      // realmWrite.insertOrUpdate(lastConversationRO);
      // realm.create(
      //   LastConversationRO.schema.name,
      //   lastConversationRO,
      //   Realm.UpdateMode.All
      // );
      // // realmWrite.insertOrUpdate(lastConversationCreatorRO);
      // realm.create(
      //   MemberRO.schema.name,
      //   lastConversationCreatorRO,
      //   Realm.UpdateMode.All
      // );
      console.log('13');
      const lastSeenConversationId = chatroom.lastSeenConversationId;
      if (lastSeenConversationId) {
        console.log('lastSeenConversationId', lastSeenConversationId);
        console.log('dataConvMeta', data.conversationMeta);
        const lastSeenConversation =
          data.conversationMeta[lastSeenConversationId?.toString()];
        console.log('userMetaData', data.userMeta);
        console.log('memberId', lastSeenConversation?.memberId);
        console.log('lastSeenConversation', lastSeenConversation);
        const lastSeenConversationCreator =
          data.userMeta[lastSeenConversation?.memberId?.toString()];

        console.log('1423424');
        // const lastSeenConversationCreatorRO = convertToMemberRO(
        //   lastSeenConversationCreator,
        //   communityId,
        // );

        console.log('14-1');

        const lastSeenConversationDeletedByMemberRO =
          lastSeenConversation?.deletedBy != null
            ? convertToMemberRO(
                data.userMeta[lastSeenConversation.deletedBy],
                communityId,
              )
            : null;

        console.log('14-2');

        const lastSeenConversationPolls = isPoll(
          lastSeenConversation?.state || 0,
        )
          ? (data.convPollsMeta[lastSeenConversationId?.toString()] || [])
              .sort((a_1: any, b_1: any) => a_1.id - b_1.id)
              .map((poll_1: any) => {
                const user_1 = data.userMeta[poll_1.userId];
                return poll_1.toBuilder().member(user_1).build();
              })
          : [];

        console.log('14-3');

        const lastSeenConversationAttachments =
          lastSeenConversation?.attachmentUploaded === true &&
          (lastSeenConversation.attachmentCount || 0) > 0
            ? data.convAttachmentsMeta[lastSeenConversationId?.toString()]
            : [];

        console.log('14-4');

        // const lastSeenConversationRO = convertToConversationRO(
        //   lastSeenConversation,
        //   lastSeenConversationCreatorRO,
        //   lastSeenConversationAttachments,
        //   lastSeenConversationPolls,
        // );
        // if (lastSeenConversationRO) {
        //   realm.create(
        //     LastConversationRO.schema.name,
        //     lastSeenConversationRO,
        //     Realm.UpdateMode.All,
        //   );
        // }
        // if (lastSeenConversationCreatorRO) {
        //   realm.create(
        //     MemberRO.schema.name,
        //     lastSeenConversationCreatorRO,
        //     Realm.UpdateMode.All,
        //   );
        // }
      }

      console.log('14-5');

      // convert to ChatroomRO
      const chatroomRO = convertToChatroomRO(
        chatroom,
        chatroomCreatorRO,
        lastConvRO,
        lastConversationRO, //its of type LastConversationRO
      );

      // console.log('chatroomRO', chatroomRO);
      // save to local DB
      if (chatroomRO) {
        chatroomRO.relationshipNeeded = true;
        realm.create(ChatroomRO.schema.name, chatroomRO, Realm.UpdateMode.All);
      }
      console.log('16-6');
    });
  });
}

// export const updateChatroomResponse = async(chatroomNew:any) => {
//     let currentChatrooms = await getChatroomData();
//     currentChatrooms = [chatroomNew,...currentChatrooms]
//     return Realm.open(Db.getInstance()).then(realm => {
//       realm.write(() => {
//         const communityId = chatroomNew?.member?.communityId;
//         const creator = chatroomNew?.member;
//         console.log('creator', creator);
//         if (!creator) return;
//         const chatroomCreatorRO = convertToMemberRO(creator, communityId);
//         if (!chatroomCreatorRO) return;
//         console.log('chatroomCreatorRO', chatroomCreatorRO);

//         const chatroomRO = convertToChatroomRO(
//           chatroomNew,
//           chatroomCreatorRO,
//           lastConvRO,
//           lastConversationRO,
//         );
//         realm.create(ChatroomRO.schema.name, chatroomRO, Realm.UpdateMode.All);
//       })
//     })

// }

// method to save conversation data
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

          // convert to ConversationRO
          const conversationRO = convertToConversationRO(
            conversation,
            chatroomCreatorRO,
            conversationAttachment,
            conversationPolls,
            conversationReaction,
          );

          // save to local DB
          if (conversationRO) {
            realm.create(
              ConversationRO.schema.name,
              conversationRO,
              Realm.UpdateMode.All,
            );
          }
        }
      }
    });

    //TODO
    // realm.close(); // Close the Realm instance after the write operation
  });
}

export async function getChatroomData() {
  console.log('getting');
  const realm = await Realm.open(Db.getInstance());
  console.log('100');
  const chatrooms = realm.objects(ChatroomRO.schema.name);
  console.log('101');
  const chatroomObject = chatrooms.map(chatroom => {
    const stringifiedChatroom = JSON.stringify(chatroom);
    return {
      ...JSON.parse(stringifiedChatroom),
    };
  });

  //TODO
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

  //TODO
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

  //TODO
  // realm.close(); // Close the Realm instance after reading data

  return coonversationObject;
}

// this function fetches specific chatroom that are stored in local DB
export async function getOneChatroomData(chatroomId: string) {
  const realm = await Realm.open(Db.getInstance());
  const items = realm.objects(ChatroomRO.schema.name);
  const chatroom = items.filtered(`id = "${chatroomId}"`);
  const chatroomObject = chatroom.map(chatroom => {
    const stringifiedChatroom = JSON.stringify(chatroom);
    return {
      ...JSON.parse(stringifiedChatroom),
    };
  });
  //TODO
  // realm.close();
  console.log('chatroomObject', chatroomObject);
  return chatroom;
}

export async function updateChatroomData(data: any, communityId: any) {
  const oldChatroom = await getOneChatroomData(data.chatroomsData[0].id);
  saveChatroomResponse(data, data?.chatroomData, communityId);
  const realm = await Realm.open(Db.getInstance());
  realm.write(() => {
    realm.delete(oldChatroom);
  });
}

export async function deleteOneChatroom(chatroomId: any) {
  console.log('deleting...');
  const oldChatroom = await getOneChatroomData(chatroomId);
  console.log('oldCHatroom', oldChatroom);
  const realm = await Realm.open(Db.getInstance());
  realm.write(() => {
    realm.delete(oldChatroom);
  });
  const chatrooms = getChatroomData();
  console.log('chatroomNewAfterDeleting', chatrooms);
}
