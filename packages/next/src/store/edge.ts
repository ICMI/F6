import { injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { updateMany, updateOne } from './entityHelper';

export class Edge {
  state = {
    entities: {},
    ids: [],
  };

  @injectTrigger
  init(data, state?) {
    data?.forEach((node) => {
      node.id = node.id || uuid();
      node.visible = true;
      node.__type = 'edge';
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

export const edge = new Edge();

export const { init } = edge;
