import AsyncStorage from '@react-native-async-storage/async-storage';
import {removeKey} from '../../commonFuctions';
import {myClient} from '../../..';
import {
  CLEAR_FILE_UPLOADING_MESSAGES,
  IS_FILE_UPLOADING,
  SET_FILE_UPLOADING_MESSAGES,
  UPDATE_FILE_UPLOADING_OBJECT,
} from '../types/types';

const initialState = {
  isFileUploading: false,
  fileUploadingID: null,
  uploadingFilesMessages: {} as any,
};

export function fileUploadReducer(state = initialState, action: any) {
  switch (action.type) {
    case IS_FILE_UPLOADING: {
      const {fileUploadingStatus, fileUploadingID} = action.body;
      return {
        ...state,
        isFileUploading: fileUploadingStatus,
        fileUploadingID: fileUploadingID,
      };
    }
    case SET_FILE_UPLOADING_MESSAGES: {
      const {message = {}, ID} = action.body;
      let obj = {[ID]: {...message}};
      let keys = Object.keys(state.uploadingFilesMessages);

      let dummyState = {
        ...state.uploadingFilesMessages,
        ...obj,
      };

      const func = async () => {
        // const res = await AsyncStorage.getItem('uploadingFilesMessages');
        // await AsyncStorage.setItem(
        //   'uploadingFilesMessages',
        //   JSON.stringify({...JSON.parse(res as any), ...dummyState}),
        // );

        myClient?.saveAttachmentUploadConversation(
          ID.toString(),
          JSON.stringify(message),
        );
        const res = await myClient?.getAllAttachmentUploadConversations();
      };

      func();
      return {
        ...state,
        uploadingFilesMessages: dummyState,
      };
    }
    case CLEAR_FILE_UPLOADING_MESSAGES: {
      const {ID} = action.body;

      // removeKey removes the sent media from retry media list, ie, obj
      let obj = removeKey(ID, state.uploadingFilesMessages);
      let dummyState = {
        ...state,
        uploadingFilesMessages: {...obj},
      };

      const func = async () => {
        // const res = await AsyncStorage.getItem('uploadingFilesMessages');
        // let obj = removeKey(ID, JSON.parse(res as any));
        // await AsyncStorage.setItem(
        //   'uploadingFilesMessages',
        //   JSON.stringify(obj),
        // );
        myClient?.removeAttactmentUploadConversationByKey(ID?.toString());
        const res = await myClient?.getAllAttachmentUploadConversations();
      };

      func();
      return dummyState;
    }

    case UPDATE_FILE_UPLOADING_OBJECT: {
      const {message = {}, ID} = action.body;
      let obj = {[ID]: {...message}};
      let dummyState = {
        ...state.uploadingFilesMessages,
        ...obj,
      };

      return {
        ...state,
        uploadingFilesMessages: {...dummyState},
      };
    }
    default:
      return state;
  }
}
