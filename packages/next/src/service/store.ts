import { configureStore, combineReducers, createSlice } from '@reduxjs/toolkit';

let store = null;

export const graphSlice = createSlice({
  name: 'graph',
  initialState: {},
  reducers: {
    initGraph: function () {},
  },
});

export const createStore = () => {
  if (store) return store;
  store = configureStore({
    reducer: combineReducers(graphSlice.reducer),
  });
  return store;
};

export const { initGraph } = graphSlice.actions;
