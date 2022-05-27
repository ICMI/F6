import { node } from './node';
import { edge } from './edge';
import { getGlobalContext } from '../service';
import { clone, identity } from '@antv/util';
import Hierarchy from '@antv/hierarchy';
import { traverseTree } from '../utils/graphic';
import { animate } from './animate';

export class Layout {
  state = {};

  node = node;
  edge = edge;

  cfg = null;

  setLayoutCfg = (cfg) => {
    this.cfg = cfg;
  };

  getLayout() {
    const layout = this.cfg;
    if (!layout) {
      return null;
    }
    if (typeof layout === 'function') {
      return layout;
    }
    if (!layout.type) {
      layout.type = 'dendrogram';
    }
    if (!layout.direction) {
      layout.direction = 'TB';
    }
    // if (layout.radial) {
    //   return (data: any) => {
    //     const layoutData = Hierarchy[layout.type](data, layout);
    //     radialLayout(layoutData);
    //     return layoutData;
    //   };
    // }
    return (data: any) => Hierarchy[layout.type](data, layout);
  }

  layout() {
    const tree = clone(this.node.getTree());

    const layout = this.getLayout();
    const layoutData = layout(tree, this.cfg);

    const nodePayload = [];
    const animatePayload = [];

    traverseTree(layoutData, (node) => {
      // animatePayload.push({
      //   relationNodeId: node.id,
      //   duration: 1500,
      //   type: 'appear',
      //   start: {
      //     x: layoutData.x,
      //     y: layoutData.y,
      //   },
      //   end: {
      //     x: node.x,
      //     y: node.y,
      //   },
      // });

      nodePayload.push({
        id: node.id,
        changes: {
          x: node.x,
          y: node.y,
        },
      });

      return true;
    });

    node.updateMany(nodePayload);

    animate.addMany(animatePayload);
  }

  getState() {}
}

export const treeLayout = new Layout();
