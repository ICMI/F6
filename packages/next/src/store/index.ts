import { store as prepareStore } from './store';
import { node } from './node';
import { edge } from './edge';
import { combo } from './combo';
import { hull } from './hull';
import { view } from './view';
import { layout } from './layout';
import { graph } from './graph';

const createStore = (): any => {
  prepareStore.init({
    node,
    edge,
    combo,
    hull,
    view,
    graph,
  });

  return prepareStore;
};

export const store = createStore();
export { node, edge, combo, hull, view, layout, graph };
