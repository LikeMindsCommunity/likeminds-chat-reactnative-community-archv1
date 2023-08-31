import {List} from 'realm';
import {AttachmentMetaRO} from '../Models/AttachmentMetaRO';
import {AttachmentRO} from '../Models/AttachmentRO';
import {ChatroomRO} from '../Models/ChatroomRO';
import {CommunityRO} from '../Models/CommunityRO';
import {LastConversationRO} from '../Models/LastConversationRO';
import {MemberRO} from '../Models/MemberRO';
import {SDKClientInfoRO} from '../Models/SDKClientInfoRO';
import {Chatroom} from '../shared/responseModels/Chatroom';
import {Community} from '../shared/responseModels/Community';
import {Conversation} from '../shared/responseModels/Conversation';
import {Member} from '../shared/responseModels/Member';
import {SDKClientInfo} from '../shared/responseModels/SDKClientInfo';
import {ConversationRO} from '../Models/ConversationRO';
import {AttachmentMeta} from '../shared/responseModels/AttachmentMeta';
import {Poll} from '../shared/responseModels/Poll';
import {PollRO} from '../Models/PollRO';
import {Reaction} from '../shared/responseModels/Reaction';
import {ReactionRO} from '../Models/ReactionRO';
import {Attachment} from '../shared/responseModels/Attachment';
import {dummyKeys} from '../Constants/dummyKeys';
import {TimeStampRO} from '../Models/TimeStampRO';

const convertToDownloadableContentTypes = (
  downloadableContentTypes: string[],
): List<string> => {
  let convertedAttachments: any = [];
  for (let i = 0; i < downloadableContentTypes.length; i++) {
    convertedAttachments.push(downloadableContentTypes[i]);
  }
  return convertedAttachments;
};

// convertCommunity method takes Community data and converts it to CommunityRO
export const convertCommunity = (community: Community): CommunityRO => {
  console.log('communityConvert', community);
  let communityRO: CommunityRO = {
    id: `${community?.id}`,
    name: `${community?.name}`,
    imageUrl: community?.imageUrl,
    membersCount: community?.membersCount,
    updatedAt: community?.updatedAt,
    relationshipNeeded: true,
    // downloadableContentTypes:
    //   community.downloadableContentTypes != undefined
    //     ? convertToDownloadableContentTypes(community.downloadableContentTypes)
    //     : null,
    // ...dummyKeys(CommunityRO),
  };
  console.log('communityConvertRO', communityRO);
  return communityRO;
};

export const convertToTimeStampRO = (
  minTimeStamp: number,
  maxTimeStamp: number,
): TimeStampRO => {
  let timeStampRO: TimeStampRO = {
    minTimeStamp: minTimeStamp,
    maxTimeStamp: maxTimeStamp,
  };
  return timeStampRO;
};

// convertToLastConversationRO method takes Conversation data and converts it to LastConversationRO
export const convertToLastConversationRO = (
  lastConversation: Conversation,
  chatroomCreatorRO: MemberRO,
  chatroomId: number,
  attachment: Attachment[],
  deletedByMember: MemberRO | null,
): LastConversationRO => {
  const lastConversationRO: LastConversationRO = {
    id: lastConversation?.id?.toString() || '',
    member: chatroomCreatorRO,
    createdAt: lastConversation.createdAt || null,
    answer: lastConversation.answer,
    state: lastConversation.state,
    attachments: convertToAttachment(
      attachment,
      chatroomId?.toString(),
      lastConversation?.communityId?.toString(),
    ),
    date: lastConversation.date || null,
    deletedBy: lastConversation.deletedBy,
    uploadWorkerUUID: lastConversation.uploadWorkerUUID,
    createdEpoch: lastConversation.createdEpoch,
    chatroomId: chatroomId?.toString(),
    communityId: lastConversation.communityId?.toString(),
    attachmentCount: lastConversation.attachmentCount,
    attachmentsUploaded: lastConversation.attachmentUploaded,
    // link:
    deletedByMember: deletedByMember,
    // ...dummyKeys(LastConversationRO),
  };

  return lastConversationRO;
};

// convertToPollRO method takes Poll data and converts it to PollRO
export const convertToPollRO = (poll: Poll, communityId: string) => {
  const pollRO: PollRO = {
    id: poll?.id,
    text: poll?.text,
    subText: poll.subText,
    isSelected: poll.isSelected,
    percentage: poll.percentage,
    noVotes: poll.noVotes,
    member:
      poll.member != undefined
        ? convertToMemberRO(poll?.member, communityId)
        : null,
    // ...dummyKeys(PollRO),
  };
  return pollRO;
};

// convertToAttachmentMetaRO method takes AttachmentMeta data and converts it to AttachmentMetaRO
const convertToAttachmentMetaRO = (attachmentMeta: AttachmentMeta) => {
  const attachmentMetaRO: AttachmentMetaRO = {
    numberOfPage: attachmentMeta?.numberOfPage,
    size: attachmentMeta?.size,
    duration: attachmentMeta?.duration,
    // ...dummyKeys(AttachmentMetaRO),
  };
  return attachmentMetaRO;
};

// convertToAttachmentRO method takes Attachment data and converts it to AttachmentRO
export const convertToAttachmentRO = (
  attachment: Attachment,
  chatroomId: string,
  communityId: string,
) => {
  const attachmentRO: AttachmentRO = {
    id: attachment?.id?.toString(),
    url:
      attachment.url == undefined
        ? attachment?.fileUrl?.toString()
        : attachment?.url?.toString(),
    name: attachment?.name,
    type: attachment?.type,
    index: attachment?.index,
    width: attachment?.width,
    height: attachment?.height,
    awsFolderPath: attachment?.awsFolderPath,
    localFilePath: attachment?.localFilePath,
    thumbnailUrl: attachment?.thumbnailUrl,
    thumbnailAWSFolderPath: attachment?.thumbnailAWSFolderPath,
    thumbnailLocalFilePath: attachment?.thumbnailLocalFilePath,
    metaRO: attachment ? convertToAttachmentMetaRO(attachment.meta) : null,
    createdAt: attachment?.createdAt,
    updatedAt: attachment?.updatedAt,
    chatroomId: chatroomId,
    communityId: communityId,
    // ...dummyKeys(AttachmentRO),
  };

  return attachmentRO;
};

// convertToSDKClientInfoRO method takes SDKClientInfo data and converts it to SDKClientInfoRO
const convertToSDKClientInfoRO = (
  sdkClientInfo: SDKClientInfo,
): SDKClientInfoRO => {
  console.log('sdkInitasdasdasd', sdkClientInfo);
  const sdkClientInfoRO: SDKClientInfoRO = {
    community: sdkClientInfo?.communityId?.toString(),
    user: `${sdkClientInfo.user}`,
    userUniqueId: sdkClientInfo.userUniqueId,
    uuid: sdkClientInfo.uuid,
    // ...dummyKeys(SDKClientInfoRO),
  };
  console.log('sdkInitROasdasds', sdkClientInfoRO);

  return sdkClientInfoRO;
};

// convertToMemberRO method takes Member data and converts it to MemberRO
export const convertToMemberRO = (
  member: Member,
  communityId: any,
): MemberRO => {
  console.log('memberSDKCLinetInfo', member);
  const convertedSdkClientInfo = convertToSDKClientInfoRO(member.sdkClientInfo);

  const memberRO: MemberRO = {
    uid: `${member.id}`,
    id: `${member.id}`,
    name: member.name,
    imageUrl: member.imageUrl || '',
    state: member.state || 0,
    customIntroText: member.customIntroText || null,
    customClickText: member.customClickText || null,
    customTitle: member.customTitle || null,
    communityId: `${communityId}`,
    isOwner: member.isOwner,
    isGuest: member.isGuest,
    userUniqueId: member.userUniqueId,
    uuid: member.uuid,
    sdkClientInfoRO: convertedSdkClientInfo,
    // ...dummyKeys(MemberRO),
  };

  console.log('memberROOOOOOOO', memberRO);

  return memberRO;
};

// convertToAttachment method takes Attachment[] data and converts it to Realm.List<AttachmentRO>
const convertToAttachment = (
  attachments: Attachment[],
  chatroomId: string,
  communityId: string,
): List<AttachmentRO> => {
  let convertedAttachments: any = [];
  for (let i = 0; i < attachments.length; i++) {
    const roAttachment = convertToAttachmentRO(
      attachments[i],
      chatroomId,
      communityId,
    );
    convertedAttachments = [...convertedAttachments, roAttachment];
  }
  return convertedAttachments;
};

// convertToReaction method takes Reaction[] data and converts it to Realm.List<ReactionRO>
const convertToReaction = (
  reactions: Reaction[],
  communityId: string,
): List<ReactionRO> => {
  let convertedReactions: any = [];
  for (let i = 0; i < reactions.length; i++) {
    const roAttachment = convertToReactionRO(reactions[i], communityId);
    console.log('roAttachment', roAttachment);
    convertedReactions = [...convertedReactions, roAttachment];
  }
  return convertedReactions;
};

// convertToPoll method takes Poll[] data and converts it to Realm.List<PollRO>
const convertToPoll = (polls: Poll[], communityId: string): List<PollRO> => {
  let convertedPolls: any = [];
  for (let i = 0; i < polls.length; i++) {
    const roAttachment = convertToPollRO(polls[i], communityId);
    convertedPolls.push(roAttachment);
  }
  return convertedPolls;
};

// convertToReactionRO method takes Reaction data and converts it to ReactionRO
const convertToReactionRO = (
  reaction: Reaction,
  communityId: string,
): ReactionRO => {
  const convertedMember =
    reaction.member != undefined
      ? convertToMemberRO(reaction.member, communityId)
      : null;
  const reactionRO: ReactionRO = {
    member: convertedMember,
    reaction: reaction.reaction,
    // ...dummyKeys(ReactionRO),
  };
  return reactionRO;
};

// convertToConversationRO method takes Conversation data and converts it to ConversationRO
export const convertToConversationRO = (
  conversation: Conversation,
  chatroomCreatorRO: MemberRO,
  attachment: Attachment[],
  polls: Poll[],
  reactions?: Reaction[],
): ConversationRO => {
  const conversationRO: ConversationRO = {
    id: `${conversation.id}` || '',
    chatroomId: '2889247', //TODO
    communityId: `${conversation.communityId}` || '',
    member: chatroomCreatorRO,
    answer: conversation?.answer,
    state: conversation?.state,
    createdEpoch: conversation?.createdEpoch || 0,
    createdAt: conversation?.createdAt || null,
    date: conversation?.date || null,
    isEdited: conversation?.isEdited || null,
    lastSeen: conversation?.lastSeen || false,
    replyConversationId: conversation?.replyConversationId || null,
    deletedBy: conversation?.deletedBy || null,
    attachmentCount: conversation?.attachmentCount || null,
    attachmentsUploaded: conversation?.attachmentUploaded || null,
    uploadWorkerUUID: conversation?.uploadWorkerUUID || null,
    localSavedEpoch: conversation?.localCreatedEpoch || 0,
    temporaryId: conversation?.temporaryId || null,
    isAnonymous: conversation?.isAnonymous || null,
    allowAddOption: conversation?.allowAddOption || null,
    pollType: conversation?.pollType || null,
    pollTypeText: conversation?.pollTypeText || null,
    submitTypeText: conversation?.submitTypeText || null,
    expiryTime: conversation?.expiryTime || null,
    multipleSelectNum: conversation?.multipleSelectNo || null,
    multipleSelectState: conversation?.multipleSelectState || null,
    pollAnswerText: conversation?.pollAnswerText || null,
    toShowResults: conversation?.toShowResults || null,
    replyChatRoomId: conversation?.replyChatroomId || null,
    lastUpdatedAt: conversation?.lastUpdated || 0,
    attachments: convertToAttachment(
      attachment,
      '2889247',
      `${conversation.communityId}`,
    ),
    // reactions: reactions
    //   ? convertToReaction(reactions, `${conversation?.communityId}`)
    //   : null, // Fetch reaction first from API resp
    polls: convertToPoll(polls, `${conversation?.communityId}`),
    // TODO
    // replyConversation: conversation?.replyConversation
    //   ? new Realm?.List<ConversationRO>(
    //       conversation?.replyConversation?.map((replyConv) => convertConversationToRO(replyConv))
    //     )
    //   : null,
    // ...dummyKeys(ConversationRO),
  };

  return conversationRO;
};

// convertToSecretChatroomParticipants method takes secretChatroomParticipants data and converts it to Realm.List<number>
const convertToSecretChatroomParticipants = (
  secretChatroomParticipants: number[],
): List<number> => {
  let convertedAttachments: any = [];
  for (let i = 0; i < secretChatroomParticipants.length; i++) {
    convertedAttachments.push(secretChatroomParticipants[i]);
  }
  return convertedAttachments;
};

// convertToChatroomRO method takes Chatroom data and converts it to ChatroomRO
export const convertToChatroomRO = (
  chatroom: Chatroom,
  member: MemberRO,
  lastConversation: ConversationRO,
  lastConversationRO?: LastConversationRO,
): ChatroomRO => {
  const chatroomRO: ChatroomRO = {
    id: chatroom.id?.toString(),
    communityId: `${chatroom.communityId}` || '',
    title: chatroom.title,
    state: chatroom.state,
    member: member,
    createdAt: chatroom.createdAt || null,
    type: chatroom.type || null,
    chatroomImageUrl: chatroom.chatroomImageUrl || null,
    header: chatroom.header || null,
    cardCreationTime: chatroom.cardCreationTime || null,
    totalResponseCount:
      chatroom?.totalResponseCount == undefined
        ? 0
        : parseInt(chatroom.totalResponseCount),
    totalAllResponseCount:
      chatroom?.totalAllResponseCount == undefined
        ? 0
        : parseInt(chatroom.totalAllResponseCount),
    muteStatus: chatroom.muteStatus || null,
    followStatus: chatroom.followStatus || null,
    hasBeenNamed: chatroom.hasBeenNamed || null,
    date: chatroom.date || null,
    isTagged: chatroom.isTagged || null,
    isPending: chatroom.isPending || null,
    deletedBy: chatroom.deletedBy || null,
    updatedAt: chatroom.updatedAt || null,
    lastConversation: lastConversation,
    lastConversationRO: lastConversationRO,
    lastSeenConversationId: `${chatroom.lastSeenConversationId}` || null,
    dateEpoch: chatroom.dateEpoch || null,
    unseenCount: chatroom.unseenCount || 0,
    relationshipNeeded: false, // Assign as needed
    isSecret: chatroom.isSecret || null,
    // secretChatRoomParticipants: chatroom?.secretChatroomParticipants
    //   ? convertToSecretChatroomParticipants(
    //       chatroom?.secretChatroomParticipants
    //     )
    //   : new List(),
    secretChatRoomLeft: chatroom.secretChatroomLeft || null,
    topicId: `${chatroom.topicId}` || null,
    autoFollowDone: chatroom.autoFollowDone || null,
    memberCanMessage: chatroom.memberCanMessage || null,
    isEdited: chatroom.isEdited || null,
    // reactions:
    //   chatroom?.reactions != undefined
    //     ? convertToReaction(chatroom?.reactions, `${chatroom.communityId}`)
    //     : null,
    unreadConversationsCount: chatroom.unreadConversationCount || null,
    accessWithoutSubscription: chatroom.accessWithoutSubscription || false,
    externalSeen: chatroom.externalSeen || null,
    isConversationStored: chatroom?.isConversationStored || false,
    lastConversationId: `${chatroom.lastConversationId}` || null,
    // ...dummyKeys(ChatroomRO),
  };

  return chatroomRO;
};
