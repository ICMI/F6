import { injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { updateMany, updateOne } from './entityHelper';

export class Hull {
  state = {
    entities: {},
    ids: [],
  };

  @injectTrigger
  init(data, state?) {
    data?.forEach((node) => {
      node.id = node.id || uuid();
      node.type = node.type || 'circle';
      node.visible = true;
      node.__type = 'hull';
      state.entities[node.id] = node;
      state.ids.push(node.id);
    });
  }

  @injectTrigger
  updateOne(data, state?) {
    updateOne(data, state);
  }

  @injectTrigger
  updateMany(data, state?) {
    updateMany(data, state);
  }

  getState() {}
}

export const hull = new Hull();

export const { init } = hull;
