import { injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { updateMany, updateOne } from './entityHelper';

export class Node {
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
      node.__type = 'node';
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

export const node = new Node();

export const { init } = node;
