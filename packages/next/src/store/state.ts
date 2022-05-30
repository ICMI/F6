import { isBoolean, isNil, isString, uniqueId } from '@antv/util';
import { node } from './node';
import { computed, injectTrigger } from './store';

class State {
  state = {};

  @injectTrigger()
  setState(data, state?) {
    const { id, ...paramStates } = data;
    if (isNil(id)) return;

    state[id] = state[id] || [];
    const states = state[id];
    for (const [key, value] of Object.entries(paramStates)) {
      let stateName = key;
      if (isString(value)) {
        stateName = `${stateName}:${value}`;
      }
      const index = states.indexOf(stateName);
      if (value) {
        if (index > -1) {
          return;
        }
        states.push(stateName);
      } else if (index > -1) {
        states.splice(index, 1);
      }
    }
  }

  @injectTrigger()
  clearStates(data, state?) {
    const { id, states: values } = data;
    if (isNil(id)) return;

    const states = state[id];

    state[id] = states.filter((state) => {
      return !values.includes(state);
    });
  }
}

export const state = new State();
