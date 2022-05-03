import { createSlice } from '@reduxjs/toolkit';
import { view } from '../application';

const viewSlice = createSlice({
  name: 'view',
  initialState: view.getInitState(),
  reducers: {
    initView: view.initView,
  },
});

export const actions = viewSlice.actions;
export const reducer = viewSlice.reducer;
