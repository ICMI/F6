import { createSlice } from '@reduxjs/toolkit';
import { edges } from '../application';

const nodesSlice = createSlice({
  name: 'edges',
  initialState: edges.getInitState(),
  reducers: {
    initEdges: edges.initEdges,
    updateEdge: edges.updateEdge,
    updateManyEdge: edges.updateManyEdge,
  },
});

export const actions = nodesSlice.actions;
export const reducer = nodesSlice.reducer;
