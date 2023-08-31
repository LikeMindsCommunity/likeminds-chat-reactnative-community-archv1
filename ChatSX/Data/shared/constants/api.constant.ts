import { environment } from "src/environment";

export const API = {
  CHATROOM_SYNC: `${environment.apiUrl}/chatroom/sync`, // (GET)
  CONVERSATION_SYNC: `${environment.apiUrl}/conversation/sync`, // (GET)
};
