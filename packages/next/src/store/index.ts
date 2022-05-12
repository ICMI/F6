import { configureStore, combineReducers, createAsyncThunk } from '@reduxjs/toolkit';
import reduceReducers from 'reduce-reducers';

import { reducer as nodesReducer, actions as nodesActions } from './nodes';
import { reducer as edgesReducer, actions as edgesActions } from './edges';
import { reducer as viewReducer, actions as viewActions } from './view';
import { reducer as comboReducer, actions as comboActions } from './combo';
import { reducer as hullReducer, actions as hullActions } from './hull';
import { actions as layoutActions } from './layout';

const reducers = combineReducers({
  nodes: nodesReducer,
  edges: edgesReducer,
  view: viewReducer,
  combo: comboReducer,
  hull: hullReducer,
});

export const store = configureStore({
  reducer: reduceReducers(reducers),
});

export const { subscribe, dispatch } = store;

export { nodesActions, edgesActions, viewActions, layoutActions, comboActions, hullActions };
