import {CommunityRO} from '../Models/CommunityRO';

export interface Community {
  id: string;
  name: string;
  imageUrl?: string;
  membersCount?: number;
  updatedAt?: number | null;
  relationshipNeeded: boolean | true;
  downloadableContentTypes: string[] | null;
}

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
