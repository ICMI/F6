import { configureStore, combineReducers, createAsyncThunk } from '@reduxjs/toolkit';
import reduceReducers from 'reduce-reducers';

import { reducer as nodesReducer, actions as nodesActions } from './nodes';
import { reducer as edgesReducer, actions as edgesActions } from './edges';
import { reducer as viewReducer, actions as viewActions } from './view';
import { actions as layoutActions } from './layout';

const reducers = combineReducers({
  nodes: nodesReducer,
  edges: edgesReducer,
  view: viewReducer,
});

export const store = configureStore({
  reducer: reduceReducers(reducers),
});

export const { subscribe, dispatch } = store;

export { nodesActions, edgesActions, viewActions, layoutActions };
