import {CommunityRO} from '../Models/CommunityRO';
import { Chatroom } from '../responseModels/Chatroom';
import { Community } from '../responseModels/Community';

export const convertCommunity = (community: any): any => {
  if (community == null) return null;
  let updatedCommunity: Community = {
    id: community?.id,
    name: community?.name,
    imageUrl: community?.imageUrl,
    membersCount: community?.membersCount,
    updatedAt: community?.updatedAt,
    relationshipNeeded: true,
    downloadableContentTypes: null,
  };
  return updatedCommunity;
};

export const convertChatroom = (chatroom: any, member?:any): any => {
  let convertedMember = convertMember(member)
  if (chatroom == null) return null;
  let updatedCommunity: Chatroom = {
    member: convertedMember,
    id: chatroom?.id,
    title: chatroom?.title,
    createdAt: chatroom?.createdAt,
    state: chatroom?.state,
    unseenCount: chatroom?.unseenCount,
    communityId: chatroom?.communityId,
    type: chatroom?.type,
    header: chatroom?.header,
    // cardCreationTime: "", // Update with actual card creation time if available
    // participantsCount: "", // Update with actual participants count if available
    // totalResponseCount: "", // Update with actual response count if available
    muteStatus: chatroom?.muteStatus,
    followStatus: chatroom?.followStatus,
    hasBeenNamed: chatroom?.hasBeenNamed,
    date: chatroom?.date,
    isTagged: chatroom?.isTagged,
    isPending: chatroom?.isPending,
    userId: chatroom?.userId,
    // deletedBy: "", // Update with actual deleted by if available
    updatedAt: chatroom?.updatedAt,
    lastSeenConversationId: chatroom?.lastSeenConversationId,
    lastConversationId: chatroom?.lastConversationId,
    dateEpoch: chatroom?.dateEpoch,
    isSecret: chatroom?.isSecret,
    secretChatroomParticipants: chatroom?.secretChatroomParticipants,
    secretChatroomLeft: chatroom?.secretChatroomLeft,
    reactions: [], // Empty array, you can populate this based on your logic
    // topicId: chatroom?.topicId,
    // topic: null, // Set to null or populate based on your logic
    autoFollowDone: chatroom?.autoFollowDone,
    isEdited: chatroom?.isEdited,
    access: chatroom?.access,
    memberCanMessage: chatroom?.memberCanMessage,
    // cohorts: [], // Empty array, you can populate this based on your logic
    externalSeen: chatroom?.externalSeen,
    // unreadConversationCount: null, // Populate based on your logic
    chatroomImageUrl: chatroom?.chatroomImageUrl,
    accessWithoutSubscription: chatroom?.accessWithoutSubscription,
  };
  
  return updatedCommunity;
};

export const convertMember = (member: any) : any => {

}
