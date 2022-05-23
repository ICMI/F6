import { injectTrigger } from './store';
import { node } from './node';
import { edge } from './edge';
import { getGlobalContext } from '../service';
import { clone } from '@antv/util';

export class Layout {
  state = {};

  node = node;
  edge = edge;

  @injectTrigger
  init(data, state) {
    const { width, height, devicePixelRatio } = data;
    state.width = width;
    state.height = height;
    state.devicePixelRatio = devicePixelRatio;
  }

  layout() {
    const globalContext = getGlobalContext();

    const nodes = clone(Object.values(this.node.state.entities));
    const edges = clone(Object.values(this.edge.state.entities));

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
      },
    );
  }

  getState() {}
}

export const layout = new Layout();

export const { init } = layout;
