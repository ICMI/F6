import { createEntityAdapter } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { injectGlobalContext } from '../utils';

const entityAdapter = createEntityAdapter();

export function getInitState() {
  return entityAdapter.getInitialState();
}

class Edges {
  @injectGlobalContext
  globalContext;

  initCombo(state, action) {
    const data = action.payload;
    data?.forEach((combo) => {
      combo.id = combo.id || uuid();
      combo.visible = true;
      combo.__type = 'combo';
    });
    entityAdapter.setAll(state, action);
  }

  updateCombo = (state, action) => {
    entityAdapter.updateOne(state, action);
  };

  updateManyCombo = (state, action) => {
    entityAdapter.updateMany(state, action);
  };
}

const instance = new Edges();
export const { initCombo, updateCombo, updateManyCombo } = instance;
