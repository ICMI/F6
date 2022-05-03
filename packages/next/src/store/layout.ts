import { clone } from '@antv/util';
import {
  createAction,
  createAsyncThunk,
  createNextState,
  createReducer,
  createSlice,
  current,
} from '@reduxjs/toolkit';
import { actions as nodesActions } from './nodes';
import { getGlobalContext } from '../service';

export const layoutAsync = createAsyncThunk(
  'layoutAsync',
  async (layoutCfg, { dispatch, getState }) => {
    const globalContext = getGlobalContext();
    const state = createNextState(getState(), () => {});

    const nodes = clone(Object.values(state.nodes.entities));
    const edges = clone(Object.values(state.edges.entities));

    globalContext.layoutService.layout(
      { nodes, edges, combos: [] },
      () => {
        const payload = nodes.map((node) => ({
          id: node.id,
          changes: {
            x: node.x,
            y: node.y,
          },
        }));
        dispatch(nodesActions.updateManyNode(payload));
      },
      () => {
        const payload = nodes.map((node) => ({
          id: node.id,
          changes: {
            x: node.x,
            y: node.y,
          },
        }));
        dispatch(nodesActions.updateManyNode(payload));
      },
    );
  },
);

export const actions = { layoutAsync: layoutAsync };
