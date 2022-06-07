import { isNil, isString } from '@antv/util';
import { action, makeObservable, observable } from 'mobx';

export class Item {
  model = {};
  states = [];

  constructor() {
    makeObservable(this, {
      model: observable,
      states: observable,
      setState: action,
      clearStates: action,
    });
  }

  get type() {
    return 'item';
  }

  get id() {
    return this.model.id;
  }

  getModel() {
    return this.model;
  }

  getType() {
    return this.type;
  }

  set id(id) {
    if (typeof id === 'number' || typeof id === 'string') this.model[id] = id;
  }

  updateItem(model) {
    this.model = { ...this.model, ...model };
  }

  setState(stateName, value) {
    const states = this.states;
    if (isString(value)) {
      stateName = `${stateName}:${value}`;
    }
    const index = states.indexOf(stateName);
    if (value) {
      if (index > -1) {
        return;
      }
      this.states = [...this.states, stateName];
    } else if (index > -1) {
      debugger;
      states.splice(index, 1);
      this.states = [...this.states];
    }
  }

  clearStates(data) {
    if (isNil(data)) {
      this.states = [];
      return;
    }
    if (Array.isArray(data)) {
      this.states = this.states.filter((state) => {
        return !data.includes(state);
      });
    }
  }

  hasState(state) {
    return this.states.indexOf(state) >= 0;
  }

  hasLocked() {
    return false;
  }

  destory() {}
}
