import {AttachmentMetaRO} from '../Models/AttachmentMetaRO';
import {AttachmentRO} from '../Models/AttachmentRO';
import {ChatroomRO} from '../Models/ChatroomRO';
import {CommunityRO} from '../Models/CommunityRO';
import {LastConversationRO} from '../Models/LastConversationRO';
import {LinkRO} from '../Models/LinkRO';
import {MemberRO} from '../Models/MemberRO';
import {SDKClientInfoRO} from '../Models/SDKClientInfoRO';
import {Attachment} from '../responseModels/Attachment';
import {Chatroom} from '../responseModels/Chatroom';
import {Community} from '../responseModels/Community';
import {Conversation} from '../responseModels/Conversation';
import {LinkOGTags} from '../responseModels/LinkOGTags';
import {Member} from '../responseModels/Member';
import {SDKClientInfo} from '../responseModels/SDKClientInfo';
import Realm from 'realm';
import Db from './db';
import {getChatroomData} from './dbhelper';
import {ConversationRO} from '../Models/ConversationRO';

export const convertCommunity = (community: any): any => {
  if (community == null) return null;
  let updatedCommunity: Community = {
    id: community?.id?.toString(),
    name: community?.name,
    imageUrl: community?.imageUrl,
    membersCount: community?.membersCount,
    updatedAt: community?.updatedAt,
    relationshipNeeded: true,
    downloadableContentTypes: null,
  };
  return updatedCommunity;
};

export const convertToSDKClientInfoRO = (
  sdkClientInfo: SDKClientInfo,
): SDKClientInfoRO => {
  // console.log('s,mnvdlfk ====>', sdkClientInfo);

  // const sdkClientInfoRO = realm.create<SDKClientInfoRO>(
  //   SDKClientInfoRO.schema.name,
  //   {
  //     community: sdkClientInfo.communityId,
  //     user: `${sdkClientInfo.user}`,
  //     userUniqueId: sdkClientInfo.userUniqueId,
  //     uuid: sdkClientInfo.uuid,
  //   },
  // );

  const sdkClientInfoRO: SDKClientInfoRO = {
    community: sdkClientInfo.communityId?.toString(),
    user: `${sdkClientInfo.user}`,
    userUniqueId: sdkClientInfo.userUniqueId,
    uuid: sdkClientInfo.uuid,
  };

  return sdkClientInfoRO;
};

export const convertToMemberRO = (
  member: Member,
  communityId: string,
): MemberRO => {
  const convertedSdkClientInfo = convertToSDKClientInfoRO(member.sdkClientInfo);
  const uuid = member.sdkClientInfo?.uuid;
  const uid = `${uuid}#${communityId}`;

  const memberRO: MemberRO = {
    uid: uid,
    id: member.id?.toString(),
    name: member.name,
    imageUrl: member.imageUrl || '',
    state: member.state || 0,
    customIntroText: member.customIntroText || null,
    customClickText: member.customClickText || null,
    customTitle: member.customTitle || null,
    communityId: communityId?.toString() || null,
    isOwner: member.isOwner,
    isGuest: member.isGuest,
    userUniqueId: member.userUniqueId,
    uuid: member.uuid,
    sdkClientInfoRO: convertedSdkClientInfo,
  };

  return memberRO;
};

export const convertToLastConversationRO = (
  lastConversation: Conversation,
  chatroomCreatorRO: MemberRO,
  chatroomId: number,
): LastConversationRO => {
  // const convertedMember = convertToMemberRO(lastConversation.member);
  let convertedDeletedByMember: MemberRO | null;
  if (lastConversation.deletedByMember == undefined) {
    convertedDeletedByMember = null;
  } else {
    // convertedDeletedByMember = convertToMemberRO(
    //   lastConversation.deletedByMember,
    // );
  }

  console.log('lastConversation ===>[[[?]]]]', lastConversation);

  const lastConversationRO: LastConversationRO = {
    id: lastConversation?.id?.toString() || '',
    member: chatroomCreatorRO,
    createdAt: lastConversation.createdAt || null,
    answer: lastConversation.answer,
    state: lastConversation.state,
    // attachments:
    date: lastConversation.date || null,
    deletedBy: lastConversation.deletedBy,
    uploadWorkerUUID: lastConversation.uploadWorkerUUID,
    createdEpoch: lastConversation.createdEpoch,
    chatroomId: chatroomId?.toString(),
    communityId: lastConversation.communityId?.toString(),
    attachmentCount: lastConversation.attachmentCount,
    attachmentsUploaded: lastConversation.attachmentUploaded,
    // link:
    // deletedByMember: convertedDeletedByMember,
  };

  return lastConversationRO;
};

export const convertToConversationRO = (
  conversation: Conversation,
  chatroomCreatorRO: MemberRO,
): ConversationRO => {
  // const realm = new Realm(Db.getInstance());
  // const convertedMember = convertToMemberRO(conversation.member);
  // console.log('convertedMember -> convertToConversationRO', convertedMember);
  console.log('conversation.chatroomId ===>', conversation.chatroomId);

  const conversationRO: ConversationRO = {
    id: conversation.id?.toString() || '',
    chatroomId: conversation.chatroomId?.toString() || '',
    communityId: conversation.communityId?.toString() || '',
    member: chatroomCreatorRO,
    answer: conversation.answer,
    state: conversation.state,
    createdEpoch: conversation.createdEpoch || 0,
    createdAt: conversation.createdAt || null,
    date: conversation.date || null,
    isEdited: conversation.isEdited || null,
    lastSeen: conversation.lastSeen,
    replyConversationId: conversation.replyConversationId || null,
    deletedBy: conversation.deletedBy || null,
    attachmentCount: conversation.attachmentCount || null,
    attachmentsUploaded: conversation.attachmentUploaded || null,
    uploadWorkerUUID: conversation.uploadWorkerUUID || null,
    localSavedEpoch: conversation.localCreatedEpoch || 0,
    temporaryId: conversation.temporaryId || null,
    isAnonymous: conversation.isAnonymous || null,
    allowAddOption: conversation.allowAddOption || null,
    pollType: conversation.pollType || null,
    pollTypeText: conversation.pollTypeText || null,
    submitTypeText: conversation.submitTypeText || null,
    expiryTime: conversation.expiryTime || null,
    multipleSelectNum: conversation.multipleSelectNum || null,
    multipleSelectState: conversation.multipleSelectState || null,
    pollAnswerText: conversation.pollAnswerText || null,
    toShowResults: conversation.toShowResults || null,
    replyChatRoomId: conversation.replyChatroomId || null,
    lastUpdatedAt: conversation.lastUpdated || 0,
    // attachments: new Realm.List<AttachmentRO>(
    //   (conversation.attachments || []).map((attachment) => ({
    //     property1: attachment.property1 || '',
    //     property2: attachment.property2 || '',
    //     // ...
    //   }))
    // ),
    // reactions: new Realm.List<ReactionRO>(
    //   (conversation.reactions || []).map((reaction) => ({
    //     property1: reaction.property1 || '',
    //     property2: reaction.property2 || '',
    //     // ...
    //   }))
    // ),
    // polls: new Realm.List<PollRO>(
    //   (conversation.polls || []).map((poll) => ({
    //     property1: poll.property1 || '',
    //     property2: poll.property2 || '',
    //     // ...
    //   }))
    // ),
    // replyConversation: conversation.replyConversation
    //   ? new Realm.List<ConversationRO>(
    //       conversation.replyConversation.map((replyConv) => convertConversationToRO(replyConv))
    //     )
    //   : null,
  };

  return conversationRO;
};

export const convertToChatroomRO = (
  chatroom: Chatroom,
  chatroomCreatorRO: MemberRO,
  lastConversationRO?: Conversation,
): ChatroomRO => {
  const realm = new Realm(Db.getInstance());
  // console.log('convertToMemberRO -- member ==>', chatroomCreatorRO);
  // const convertedMember = convertToMemberRO(member, communityId);
  console.log('convertedMember', chatroomCreatorRO);

  const chatroomRO: ChatroomRO = {
    id: `${chatroom.id}`,
    communityId: `${chatroom.communityId}` || '',
    title: chatroom.title,
    state: chatroom.state,
    member: chatroomCreatorRO,
    createdAt: chatroom.createdAt || null,
    type: chatroom.type || null,
    chatroomImageUrl: chatroom.chatroomImageUrl || null,
    header: chatroom.header || null,
    cardCreationTime: chatroom.cardCreationTime || null,
    totalResponseCount: parseInt('0'), //TODO
    totalAllResponseCount: parseInt('0'), // TODO
    muteStatus: chatroom.muteStatus || null,
    followStatus: chatroom.followStatus || null,
    hasBeenNamed: chatroom.hasBeenNamed || null,
    date: chatroom.date || null,
    isTagged: chatroom.isTagged || null,
    isPending: chatroom.isPending || null,
    deletedBy: chatroom.deletedBy || null,
    updatedAt: chatroom.updatedAt || null,
    // lastConversation: convertedLastConversation,
    // lastConversationRO: convertedLastConversationRO,
    lastSeenConversationId: chatroom.lastSeenConversationId || null,
    // lastSeenConversation: chatroom.lastSeenConversation || null,  //TODO
    dateEpoch: chatroom.dateEpoch || null,
    unseenCount: chatroom.unseenCount || 0,
    relationshipNeeded: false, // Assign as needed
    // draftConversation: chatroom.draftConversation || null,
    isSecret: chatroom.isSecret || null,
    // secretChatRoomParticipants: new Realm.List<number>(
    //   ...(chatroom.secretChatroomParticipants || []),
    // ),
    secretChatRoomLeft: chatroom.secretChatroomLeft || null,
    // conversations: new Realm.List<ConversationRO>(
    //   ...(chatroom.conversations || []),
    // ),
    topicId: `${chatroom.topicId}` || null,
    // topic: topicRO,  //TODO
    autoFollowDone: chatroom.autoFollowDone || null,
    memberCanMessage: chatroom.memberCanMessage || null,
    isEdited: chatroom.isEdited || null,
    // reactions: new Realm.List<ReactionRO>(...reactions),
    unreadConversationsCount: chatroom.unreadConversationCount || null,
    accessWithoutSubscription: chatroom.accessWithoutSubscription || false,
    externalSeen: chatroom.externalSeen || null,
    isConversationStored: false, // Assign as needed
    // isDraft: chatroom.isDraft || null,
    lastConversationId: `${chatroom.lastConversationId}` || null,
  };

  return chatroomRO;
};

// const convertToMemberRO = (member: Member): MemberRO => {
//   console.log('member -->', member);

//   const memberRo: MemberRO = {
//     uid: member.id,
//       id: member.id,
//       name: member.name,
//       imageUrl: member.imageUrl || '',
//       state: member.state || 0,
//       customIntroText: member.customIntroText || null,
//       customClickText: member.customClickText || null,
//       customTitle: member.customTitle || null,
//       communityId: member.communityId || null,
//       isOwner: member.isOwner,
//       isGuest: member.isGuest,
//       userUniqueId: member.userUniqueId,
//       uuid: member.uuid,
//       // sdkClientInfoRO: convertedSdkClientInfo, // Populate this if needed
//   };

//   return memberRo;

// const realm = new Realm(); // Initialize Realm
// const convertedSdkClientInfo = convertToSDKClientInfoRO(member.sdkClientInfo);
// console.log('convertedSdkClientInfo ==', convertedSdkClientInfo);
// Begin a write transaction
// realm.write(() => {
//   const memberRO: MemberRO = realm.create(MemberRO.schema.name, {
//     uid: member.id,
//     id: member.id,
//     name: member.name,
//     imageUrl: member.imageUrl || '',
//     state: member.state || 0,
//     customIntroText: member.customIntroText || null,
//     customClickText: member.customClickText || null,
//     customTitle: member.customTitle || null,
//     communityId: member.communityId || null,
//     isOwner: member.isOwner,
//     isGuest: member.isGuest,
//     userUniqueId: member.userUniqueId,
//     uuid: member.uuid,
//     // sdkClientInfoRO: convertedSdkClientInfo, // Populate this if needed
//   });
// });

// Return the created MemberRO
// return realm.objects<MemberRO>(MemberRO.schema.name)[0];
// };

// function convertToLinkRO(link: LinkOGTags): LinkRO {
//   const realm = new Realm(); // Initialize Realm

//   // Begin a write transaction
//   realm.write(() => {
//     const linkRO: LinkRO = realm.create(LinkRO.schema.name, {
//       url: link.url || '',
//       chatroomId: '', // You need to provide chatroomId and communityId values
//       communityId: '', // based on your use case
//       title: link.title || null,
//       image: link.image || null,
//       description: link.description || null,
//     });
//   });

//   // Return the created LinkRO
//   return realm.objects<LinkRO>(LinkRO.schema.name)[0];
// }

// function convertToLastConversationRO(
//   lastConversation: Conversation,
// ): LastConversationRO {
//   const realm = new Realm(); // Initialize Realm
//   const convertedMember = convertToMemberRO(lastConversation.member);
//   // const convertedAttachment= convertToAttachmentRO(lastConversation.attachments)
//   const convertedLink = convertToLinkRO(lastConversation.ogTags);

//   // Begin a write transaction
//   realm.write(() => {
//     const lastConversationRO: LastConversationRO = realm.create(
//       LastConversationRO.schema.name,
//       {
//         id: lastConversation.id || '',
//         member: convertedMember,
//         createdAt: lastConversation.createdAt || null,
//         answer: lastConversation.answer,
//         state: lastConversation.state,
//         // attachments: new Realm.List<AttachmentRO>(...attachments),  //TODO
//         date: lastConversation.date || null,
//         deletedBy: lastConversation.deletedBy || null,
//         attachmentCount: lastConversation.attachmentCount || null,
//         attachmentsUploaded: lastConversation.attachmentUploaded || null,
//         uploadWorkerUUID: lastConversation.uploadWorkerUUID || null,
//         createdEpoch: lastConversation.createdEpoch || 0,
//         chatroomId: lastConversation.chatroomId || '',
//         communityId: lastConversation.communityId || '',
//         link: convertedLink,
//         // deletedByMember: deletedByMemberRO, //TODO
//         // ... Continue with other properties ...
//       },
//     );
//   });

//   // Return the created LastConversationRO
//   return realm.objects<LastConversationRO>(LastConversationRO.schema.name)[0];
// }

// function convertToAttachmentRO(attachment: Attachment): AttachmentRO {
//   const realm = new Realm(); // Initialize Realm

//   // Begin a write transaction
//   realm.write(() => {
//     const metaRO: AttachmentMetaRO | null = attachment.meta
//       ? realm.create(AttachmentMetaRO.schema.name, attachment.meta)
//       : null;

//     const attachmentRO: AttachmentRO = realm.create(AttachmentRO.schema.name, {
//       id: attachment.id,
//       url: attachment.url,
//       // chatroomId: attachment.chatroomId, // TODO
//       // communityId: attachment.communityId, // TODO
//       name: attachment.name || null,
//       type: attachment.type,
//       index: attachment.index || null,
//       width: attachment.width || null,
//       height: attachment.height || null,
//       awsFolderPath: attachment.awsFolderPath,
//       localFilePath: attachment.localFilePath,
//       thumbnailUrl: attachment.thumbnailUrl,
//       thumbnailAWSFolderPath: attachment.thumbnailAWSFolderPath,
//       thumbnailLocalFilePath: attachment.thumbnailLocalFilePath,
//       metaRO: metaRO,
//       createdAt: attachment.createdAt,
//       updatedAt: attachment.updatedAt,
//     });
//   });

//   // Return the created AttachmentRO
//   return realm.objects<AttachmentRO>(AttachmentRO.schema.name)[0];
// }

// export const convertChatroom = (chatroom: any, member?: any): any => {
//   console.log('memberHUMai', member);
//   let convertedMember = convertMember(member);
//   if (chatroom == null) return null;
//   let updatedCommunity: Chatroom = {
//     member: convertedMember,
//     id: chatroom?.id,
//     title: chatroom?.title,
//     createdAt: chatroom?.createdAt,
//     state: chatroom?.state,
//     unseenCount: chatroom?.unseenCount,
//     communityId: chatroom?.communityId,
//     type: chatroom?.type,
//     header: chatroom?.header,
//     // cardCreationTime: "", // Update with actual card creation time if available
//     // participantsCount: "", // Update with actual participants count if available
//     // totalResponseCount: "", // Update with actual response count if available
//     muteStatus: chatroom?.muteStatus,
//     followStatus: chatroom?.followStatus,
//     hasBeenNamed: chatroom?.hasBeenNamed,
//     date: chatroom?.date,
//     isTagged: chatroom?.isTagged,
//     isPending: chatroom?.isPending,
//     userId: chatroom?.userId,
//     // deletedBy: "", // Update with actual deleted by if available
//     updatedAt: chatroom?.updatedAt,
//     lastSeenConversationId: chatroom?.lastSeenConversationId,
//     lastConversationId: chatroom?.lastConversationId,
//     dateEpoch: chatroom?.dateEpoch,
//     isSecret: chatroom?.isSecret,
//     secretChatroomParticipants: chatroom?.secretChatroomParticipants,
//     secretChatroomLeft: chatroom?.secretChatroomLeft,
//     reactions: [], // Empty array, you can populate this based on your logic
//     // topicId: chatroom?.topicId,
//     // topic: null, // Set to null or populate based on your logic
//     autoFollowDone: chatroom?.autoFollowDone,
//     isEdited: chatroom?.isEdited,
//     access: chatroom?.access,
//     memberCanMessage: chatroom?.memberCanMessage,
//     // cohorts: [], // Empty array, you can populate this based on your logic
//     externalSeen: chatroom?.externalSeen,
//     // unreadConversationCount: null, // Populate based on your logic
//     chatroomImageUrl: chatroom?.chatroomImageUrl,
//     accessWithoutSubscription: chatroom?.accessWithoutSubscription,
//   };

//   return updatedCommunity;
// };

// export const convertMember = (member: Member): Member => {
//   let convertedSdkClientInfo = convertSdkClientInfo(member?.sdkClientInfo);
//   let updatedCommunity: Member = {
//     id: member?.id,
//     userUniqueId: convertedSdkClientInfo?.userUniqueId,
//     name: member?.name,
//     imageUrl: member?.imageUrl,
//     // questionAnswers?: Question[];
//     state: member?.state,
//     isGuest: member?.isGuest,
//     // customIntroText?: string;
//     // customClickText?: string;
//     // memberSince?: string;
//     // communityName?: string;
//     isOwner: member?.isOwner,
//     customTitle: member?.customTitle,
//     // menu?: MemberAction[];
//     communityId: convertedSdkClientInfo?.communityId,
//     // chatroomId?: number;
//     // route?: string;
//     // attendingStatus?: boolean;
//     // hasProfileImage?: boolean;
//     // updatedAt?: number;
//     sdkClientInfo: convertedSdkClientInfo,
//     uuid: convertedSdkClientInfo?.uuid,
//   };
//   return updatedCommunity;
// };

// export const convertSdkClientInfo = (
//   sdkClientInfo: SDKClientInfo,
// ): SDKClientInfo => {
//   let updatedCommunity: SDKClientInfo = {
//     communityId: sdkClientInfo?.communityId,
//     user: sdkClientInfo?.user,
//     userUniqueId: sdkClientInfo?.userUniqueId,
//     uuid: sdkClientInfo?.uuid,
//   };
//   return updatedCommunity;
// };

// export const convertConversation = (conversation:any) :any => {
//   let convertedMember = convertMember(conversation?.member);
//   let updatedCommunity:Conversation = {
//     id: conversation?.id,
//     // chatroomId?: string;
//     communityId: conversation?.communityId,
//     // member: convertedMember, // TODO
//     answer: conversation?.answer,
//     createdAt: conversation?.createdAt,
//     state: conversation?.state,
//     // attachments?: Attachment[];   TODO
//     // lastSeen?: boolean;
//     ogTags: conversation?.ogTags,
//     date: conversation?.date,
//     isEdited: conversation?.isEdited,
//     // memberId: convertedMember?.memberId, // TODO
//     replyConversationId?: string;
//     replyConversation?: Conversation;
//     deletedBy?: string;
//     createdEpoch?: number;
//     attachmentCount?: number;
//     attachmentUploaded?: boolean;
//     uploadWorkerUUID?: string;
//     temporaryId?: string;
//     localCreatedEpoch?: number;
//     reactions?: Reaction[];
//     isAnonymous?: boolean;
//     allowAddOption?: boolean;
//     pollType?: number;
//     pollTypeText?: string;
//     submitTypeText?: string;
//     expiryTime?: number;
//     multipleSelectNum?: number;
//     multipleSelectState?: number;
//     polls?: Poll[];
//     toShowResults?: boolean;
//     pollAnswerText?: string;
//     replyChatroomId?: string;
//     deviceId?: string;
//     hasFiles?: boolean;
//     hasReactions?: boolean;
//     lastUpdated?: number;
//     deletedByMember?: Member;
//   }
// }
