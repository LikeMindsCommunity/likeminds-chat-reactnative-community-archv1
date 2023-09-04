import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import thunk, {ThunkMiddleware} from 'redux-thunk';
import apiMiddleware from './ChatSX/store/apiMiddleware';
import {chatroomReducer} from './ChatSX/store/reducers/chatroomReducer';
import {explorefeedReducer} from './ChatSX/store/reducers/explorefeedReducer';
import {homefeedReducer} from './ChatSX/store/reducers/homefeedReducer';
import {loader} from './ChatSX/store/reducers/loader';
import {fileUploadReducer} from './ChatSX/store/reducers/fileUploadReducer';

const rootReducer = combineReducers({
  homefeed: homefeedReducer,
  chatroom: chatroomReducer,
  explorefeed: explorefeedReducer,
  loader: loader,
  upload: fileUploadReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk as ThunkMiddleware, apiMiddleware],
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
