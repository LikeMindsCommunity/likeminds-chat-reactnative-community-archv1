import AsyncStorage from '@react-native-async-storage/async-storage';
import {removeKey} from '../../commonFuctions';
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
      console.log('SET_FILE_UPLOADING_MESSAGES ==', obj, obj[ID].isInProgress);
      let keys = Object.keys(state.uploadingFilesMessages);

      let dummyState = {
        ...state.uploadingFilesMessages,
        ...obj,
      };
      console.log(
        `uploadingFilesMessages ${ID}==`,
        dummyState[ID]?.isInProgress,
      );

      const func = async () => {
        await AsyncStorage.setItem(
          'uploadingFilesMessages',
          JSON.stringify({...dummyState}),
        );
      };

      // func();
      return {
        ...state,
        uploadingFilesMessages: dummyState,
      };
    }
    case CLEAR_FILE_UPLOADING_MESSAGES: {
      const {ID} = action.body;
      let obj = removeKey(ID, state.uploadingFilesMessages);
      let dummyState = {
        ...state,
        uploadingFilesMessages: {...obj},
      };

      console.log(`clear uploadingFilesMessages ${ID}==`, dummyState);
      const func = async () => {
        await AsyncStorage.setItem(
          'uploadingFilesMessages',
          JSON.stringify(dummyState),
        );
      };

      // func();
      return dummyState;
    }

    case UPDATE_FILE_UPLOADING_OBJECT: {
      const {obj} = action.body;
      return {
        ...state,
        uploadingFilesMessages: {...obj},
      };
    }
    default:
      return state;
  }
}
