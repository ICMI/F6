import { createSlice } from '@reduxjs/toolkit';
import { edges } from '../application';

const nodesSlice = createSlice({
  name: 'edges',
  initialState: edges.getInitState(),
  reducers: {
    initEdges: edges.initEdges,
  },
});

export const actions = nodesSlice.actions;
export const reducer = nodesSlice.reducer;
