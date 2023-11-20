export interface UserInfo {
  customTitle: string;
  id: number;
  imageUrl: string;
  isGuest: boolean;
  isOwner: boolean;
  name: string;
  organisationName: string | null;
  sdkClientInfo: {
    community: number;
    user: number;
    userUniqueId: string;
    uuid: string;
    widgetId: string;
  };
  state: number;
  updatedAt: number;
  userUniqueId: string;
  uuid: string;
}
