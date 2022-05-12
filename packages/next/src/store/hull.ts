import { createSlice } from '@reduxjs/toolkit';
import { hull } from '../application';

const nodesSlice = createSlice({
  name: 'hulls',
  initialState: hull.getInitState(),
  reducers: {
    initHull: hull.initHull,
    updateHull: hull.updateHull,
    updateManyHull: hull.updateManyHull,
  },
});

export const actions = nodesSlice.actions;
export const reducer = nodesSlice.reducer;
