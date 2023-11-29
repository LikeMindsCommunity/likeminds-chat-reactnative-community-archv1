import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import thunk, {ThunkMiddleware} from 'redux-thunk';
import apiMiddleware from './store/apiMiddleware';
import {chatroomReducer} from './store/reducers/chatroomReducer';
import {explorefeedReducer} from './store/reducers/explorefeedReducer';
import {homefeedReducer} from './store/reducers/homefeedReducer';
import {loader} from './store/reducers/loader';
import {fileUploadReducer} from './store/reducers/fileUploadReducer';

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
