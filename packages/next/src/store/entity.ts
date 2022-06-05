import { computed, injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { isNil } from '@antv/util';

export class Entity {
  state = {
    entities: {},
    ids: [],
  };

  @injectTrigger()
  init(data, state?) {
    data?.forEach((item) => {
      item.id = isNil(item.id) ? uuid() : item.id;
      state.entities[item.id] = this.createOne(item);
      state.ids.push(item.id);
    });
  }

  createOne(item) {
    return item;
  }

  @injectTrigger()
  updateOne(data, state?) {
    const { id, changes } = data;
    if (state.entities[id]) {
      state.entities[id] = { ...state.entities[id], ...changes };
    }
  }

  @injectTrigger()
  addOne(item, state?) {
    item.id = isNil(item.id) ? uuid() : item.id;
    state.entities[item.id] = this.createOne(item);
    state.ids.push(item.id);
  }

  @injectTrigger()
  removeOne(id, state?) {
    delete state.entities[id];
    state.ids.splice(state.ids.indexOf(id), 1);
  }

  @injectTrigger()
  updateMany(data, state?) {
    data?.forEach((data) => {
      const { id, changes } = data;
      if (state.entities[id]) {
        state.entities[id] = { ...state.entities[id], ...changes };
      }
    });
  }

  @injectTrigger()
  addMany(data, state?) {
    data?.forEach((item) => {
      item.id = isNil(item.id) ? uuid() : item.id;
      state.entities[item.id] = this.createOne(item);
      state.ids.push(item.id);
    });
  }

  getById(id) {
    return this.state.entities[id];
  }

  has(id) {
    return !!this.state.entities[id];
  }
}
