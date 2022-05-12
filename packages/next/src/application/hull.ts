import { createEntityAdapter } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { injectGlobalContext } from '../utils';

const entityAdapter = createEntityAdapter();

export function getInitState() {
  return entityAdapter.getInitialState();
}

class Hull {
  @injectGlobalContext
  globalContext;

  initHull(state, action) {
    const data = action.payload;
    data?.forEach((combo) => {
      combo.id = combo.id || uuid();
      combo.visible = true;
      combo.__type = 'combo';
    });
    entityAdapter.setAll(state, action);
  }

  updateHull = (state, action) => {
    entityAdapter.updateOne(state, action);
  };

  updateManyHull = (state, action) => {
    entityAdapter.updateMany(state, action);
  };
}

const instance = new Hull();
export const { initHull, updateHull, updateManyHull } = instance;
