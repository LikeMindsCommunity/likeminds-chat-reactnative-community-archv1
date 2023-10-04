export interface DeepLinkRequest {
  uri: string;
  userName: string;
  uuid: string;
  isGuest: boolean;
}

export interface DeepLinkResponse {
  success: boolean;
  errorMessage?: string;
  data?: Record<string, string>;
}
