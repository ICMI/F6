import { uniqueId } from '@antv/util';
import { combo } from './combo';
import { edge } from './edge';
import { hull } from './hull';
import { node } from './node';
import { computed, injectTrigger } from './store';
import { treeLayout } from './treeLayout';
import { layout as graphLayout } from './layout';
import { view } from './view';
import { formatPadding } from '../utils';
import { ext } from '@antv/matrix-util';
import { getGlobalContext } from '../service';

const { transform } = ext;

export class Graph {
  state = {
    matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    canvasBBox: null,
    fitViewPadding: 0,
  };

  node = node;
  edge = edge;
  view = view;
  combo = combo;
  hull = hull;
  treeLayout = treeLayout;

  initGraph(props) {
    const { data, width, height, devicePixelRatio, layout } = props;
    view.init({
      width,
      height,
      devicePixelRatio,
    });
    node.init(data.nodes);
    edge.init(data.edges);
    combo.init(data.combos || []);
    hull.init(data.hulls || []);
    graphLayout.layout();
  }

  initTreeGraph(props) {
    const { data, width, height, devicePixelRatio, layout } = props;
    let nodes = [];
    let edges = [];
    const stack = [[null, data.tree]];
    while (stack.length) {
      for (let i = 0, len = stack.length; i < len; i++) {
        const [parent, node] = stack.pop();
        node.id = node.id || uniqueId();
        nodes.push(node);
        parent &&
          edges.push({
            source: parent.id,
            target: node.id,
          });
        node.children &&
          node.children.forEach((child) => {
            stack.push([node, child]);
          });
      }
    }
    this.node.setRootId(data.tree.id);
    this.view.init({
      width,
      height,
      devicePixelRatio,
    });
    this.node.init(nodes);
    this.edge.init(edges);
    this.combo.init(data.combos || []);
    this.hull.init(data.hulls || []);
    this.treeLayout.setLayoutCfg(layout);
    // treeLayout.layout();
  }

  @injectTrigger()
  translate(data, state?) {
    const { x = 0, y = 0 } = data;
    state.matrix = transform(state.matrix, [['t', x, y]]);
  }

  translateTo(data) {
    const { x: tox = 0, y: toy = 0 } = data;
    const curX = this.state.matrix[6];
    const cury = this.state.matrix[7];

    this.translate({ x: tox - curX, y: toy - cury });
  }

  @injectTrigger()
  zoom(data, state?) {
    const { ratio, center } = data;
    if (center) {
      state.matrix = transform(state.matrix, [
        ['t', -center.x, -center.y],
        ['s', ratio, ratio],
        ['t', center.x, center.y],
      ]);
    } else {
      state.matrix = transform(state.matrix, [['s', ratio, ratio]]);
    }
  }

  zoomTo(data) {
    const { ratio: toRatio, center } = data;
    const ratio = toRatio / this.state.matrix[0];
    this.zoom({ ratio, center });
  }

  @injectTrigger()
  resetTransform(state?) {
    state.matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  @computed()
  fitView() {
    const padding = formatPadding(this.state.fitViewPadding);
    const width: number = view.state.width;
    const height: number = view.state.height;
    const bbox = this.getCanvasBBox();

    if (bbox.width === 0 || bbox.height === 0) return;
    const viewCenter = this.getViewCenter();

    const groupCenter: Point = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    };

    this.translate({ x: viewCenter.x - groupCenter.x, y: viewCenter.y - groupCenter.y });
    const w = (width - padding[1] - padding[3]) / bbox.width;
    const h = (height - padding[0] - padding[2]) / bbox.height;
    let ratio = w;
    if (w > h) {
      ratio = h;
    }
    this.zoomTo({ ratio, center: viewCenter });
  }

  getViewCenter(): Point {
    const padding = formatPadding(this.state.fitViewPadding);
    const width: number = view.state.width;
    const height: number = view.state.height;
    return {
      x: (width - padding[1] - padding[3]) / 2 + padding[3],
      y: (height - padding[0] - padding[2]) / 2 + padding[0],
    };
  }

  removeItem(id) {}

  getCanvasBBox() {}
  inject(key, fn) {
    this[key] = fn;
  }
}

export const graph = new Graph();
