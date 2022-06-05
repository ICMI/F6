import { node } from './node';
import { edge } from './edge';
import { getGlobalContext } from '../service';
import { clone } from '@antv/util';
import { injectTrigger } from './store';

export class Layout {
  state = {
    layouting: false,
  };

  node = node;
  edge = edge;

  @injectTrigger()
  updateLayoutStatus(status, state?) {
    state.layouting = status;
  }

  layout() {
    const globalContext = getGlobalContext();

    const nodes = clone(Object.values(this.node.state.entities));
    const edges = clone(Object.values(this.edge.state.entities));
    this.updateLayoutStatus(true);
    globalContext.layoutService.layout(
      { nodes, edges, combos: [] },
      () => {
        const payload = nodes.map((node) => ({
          id: node.id,
          changes: {
            x: node.x,
            y: node.y,
          },
        }));
        node.updateMany(payload);
      },
      () => {
        const payload = nodes.map((node) => ({
          id: node.id,
          changes: {
            x: node.x,
            y: node.y,
          },
        }));
        node.updateMany(payload);
        this.updateLayoutStatus(false);
      },
    );
  }

  getState() {}
}

export const layout = new Layout();
