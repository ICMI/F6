import { createEntityAdapter } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { injectGlobalContext } from '../utils';

const edgesAdapter = createEntityAdapter();

export function getInitState() {
  return edgesAdapter.getInitialState();
}

function getInitEdgeState() {
  return {
    id: '',
    source: '',
    target: '',
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 0, y: 0 },
    controlPoints: [],
    curveOffset: 0,
    minCurveOffset: 0,
    // loop edge config
    loopCfg: {},
    labelCfg: {},
    curvePosition: 0,
  };
}

class Edges {
  @injectGlobalContext
  globalContext;

  initEdges(state, action) {
    const data = action.payload;
    data?.forEach((edge) => {
      edge.id = edge.id || uuid();
      edge.visible = true;
    });
    edgesAdapter.setAll(state, action);
  }

  updateEdge = (state, action) => {
    edgesAdapter.updateOne(state, action);
  };

  updateManyEdge = (state, action) => {
    edgesAdapter.updateMany(state, action);
  };
}

const instance = new Edges();
export const { initEdges, updateEdge, updateManyEdge } = instance;
