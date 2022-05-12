import { createSlice } from '@reduxjs/toolkit';
import { combo } from '../application';

const nodesSlice = createSlice({
  name: 'combo',
  initialState: combo.getInitState(),
  reducers: {
    initCombo: combo.initCombo,
    updateCombo: combo.updateCombo,
    updateManyCombo: combo.updateManyCombo,
  },
});

export const actions = nodesSlice.actions;
export const reducer = nodesSlice.reducer;
