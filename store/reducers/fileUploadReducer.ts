import {removeKey} from '../../commonFuctions';
import {
  CLEAR_FILE_UPLOADING_MESSAGES,
  IS_FILE_UPLOADING,
  SET_FILE_UPLOADING_MESSAGES,
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

      return {
        ...state,
        uploadingFilesMessages: {
          ...state.uploadingFilesMessages,
          ...obj,
        },
      };
    }
    case CLEAR_FILE_UPLOADING_MESSAGES: {
      const {message = {}, ID} = action.body;
      let obj = removeKey(ID, state.uploadingFilesMessages);
      return {
        ...state,
        uploadingFilesMessages: {...obj},
      };
    }
    default:
      return state;
  }
}
