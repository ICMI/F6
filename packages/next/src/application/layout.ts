import { actions } from '../store/nodes';
import { injectGlobalContext } from '../utils';

export function getInitState() {
  return {
    status: 'none',
  };
}

class Layout {
  @injectGlobalContext
  globalContext;

  layout = (state, action) => {
    const globalContext = this.globalContext;
    const nodes = Object.values(state.nodes.entities);
    const edges = Object.values(state.edges.entities);
    const { width, height } = state.view;

    // globalContext.layoutService.layout(nodes, edges, [], width, height, () => {
    //   console.log('done');
    // });
    // globalContext.layoutService.initPositions([width / 2, height / 2], nodes, width, height);
  };
}

export const { layout } = new Layout();
