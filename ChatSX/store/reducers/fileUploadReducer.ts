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
      // console.log('Adsadasd');

      const {message = {}, ID} = action.body;
      let obj = {[ID]: {...message}};
      // console.log('objasdsad', obj);

      let dummyState = {
        ...state.uploadingFilesMessages,
        ...obj,
      };

      // console.log('dummyState', dummyState);

      // this method is used to save attachment in realm to retrieve attachment incase of image upload failure
      // const saveAttachment = () => {
      //   console.log('fsasdasda', JSON.stringify(message));

      //   myClient?.saveAttachmentUploadConversation(
      //     ID.toString(),
      //     JSON.stringify(message),
      //   );
      //   console.log('dsmf sdjkf');
      // };
      // console.log('dafasdasd');

      // saveAttachment();
      // console.log('n dajs');

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

      // const func = () => {
      //   myClient?.removeAttactmentUploadConversationByKey(ID?.toString());
      // };

      // func();
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
