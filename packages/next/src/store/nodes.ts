import {
  configureStore,
  combineReducers,
  createSlice,
  EnhancedStore,
  createAction,
} from '@reduxjs/toolkit';
import { nodes } from '../application';

const nodesSlice = createSlice({
  name: 'nodes',
  initialState: nodes.getInitState(),
  reducers: {
    initNodes: nodes.initNodes,
    updateNode: nodes.updateNode,
    updateManyNode: nodes.updateManyNode,
  },
});

export const actions = nodesSlice.actions;
export const reducer = nodesSlice.reducer;
