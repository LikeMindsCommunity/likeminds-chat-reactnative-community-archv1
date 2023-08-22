export interface Community {
  id: number;
  name: string;
  imageUrl?: string;
  membersCount?: number;
  updatedAt?: number;
  relationshipNeeded: boolean | true;
  downloadableContentTypes?: string[] | null;
}
