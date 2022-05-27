import { store as prepareStore } from './store';
import { node } from './node';
import { edge } from './edge';
import { combo } from './combo';
import { hull } from './hull';
import { view } from './view';
import { layout } from './layout';
import { graph } from './graph';
import { animate } from './animate';
import { state } from './state';

const createStore = (): any => {
  prepareStore.init({
    node,
    edge,
    combo,
    hull,
    view,
    graph,
    animate,
    state,
  });

  return prepareStore;
};

export const store = createStore();
export { node, edge, combo, hull, view, layout, graph };
