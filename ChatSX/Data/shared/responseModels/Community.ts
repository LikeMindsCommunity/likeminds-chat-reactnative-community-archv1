export interface Community {
  id: string;
  name: string;
  imageUrl?: string;
  membersCount?: number;
  updatedAt?: number;
  relationshipNeeded: boolean | true;
  hideDmTab?: boolean | false;
  // downloadableContentTypes?: string[] | null;
}
