import { extend, uniqueId } from '@antv/util';
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
import { Graph } from './graph';
import { each } from 'immer/dist/internal';
import { traverseTreeUp } from '../utils/graphic';

const { transform } = ext;

export class TreeGraph extends Graph {
  originData = {};
  layoutCfg = {};

  init(props) {
    const { data, layout } = props;
    this.originData = data;
    this.layoutCfg = layout;
  }

  findById(id) {
    return node.state.entities[id];
  }

  /**
   * 向🌲树中添加数据
   * @param treeData 树图数据
   * @param parent 父节点实例
   * @param animate 是否开启动画
   */
  private innerAddChild(treeData, parent) {
    const stack = [[parent, treeData]];
    let nodes = [];
    let edges = [];
    while (stack.length) {
      const [parent, node] = stack.pop();

      for (let i = 0, len = stack.length; i < len; i++) {
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

    // self.emit('afteraddchild', { item: node, parent });
    this.node.addMany(nodes);
  }

  /**
   * 删除子节点Item对象
   * @param id
   * @param to
   * @param animate
   */
  private innerRemoveChild(id: string) {
    const self = this;

    const node = self.findById(id);

    traverseTreeUp(node, (child) => {
      if (!child) {
        return true;
      }
      self.removeItem(child);
      return true;
    });
  }

  innerUpdateChild() {
    let nodes = [];
    let edges = [];
    const data = this.originData;
    const stack = [[null, data]];
    while (stack.length) {
      for (let i = 0, len = stack.length; i < len; i++) {
        const [parent, node] = stack.pop();
        const current = this.findById(data.id);

        if (!current) {
          this.innerAddChild(node, current);
        }

        nodes.push(node);

        node.children &&
          node.children.forEach((child) => {
            stack.push([node, child]);
          });

        const currentChildren = current.children;
        if (currentChildren) {
          for (let i = currentChildren.length; i > 0; i--) {
            const child = currentChildren[i];
            const node = this.findDataById(child.id);
            if (!node) {
              this.innerRemoveChild(node.id);
            }
          }
        }
      }
    }
    node.updateMany(nodes);
  }

  findDataById(id: string, parent?) {
    const self = this;

    if (id === parent.id) {
      return parent;
    }

    let result: TreeGraphData | null = null;
    // eslint-disable-next-line consistent-return
    each(parent.children || [], (child) => {
      if (child.id === id) {
        result = child;
        return false;
      }
      result = self.findDataById(id, child);
      if (result) {
        return false;
      }
    });

    return result;
  }

  addChild(data, parentId) {
    const parent = this.findDataById(parentId, this.originData);
    // 更新数据
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(data);
    }
    this.innerUpdateChild();
  }

  public changeData(data?: GraphData | TreeGraphData): any {
    const self = this;

    // 更改数据源后，取消所有状态
    // this.getNodes().map((node) => self.clearItemStates(node));
    // this.getEdges().map((edge) => self.clearItemStates(edge));

    if (data) {
      // self.data(data);
      // self.render();
    } else {
      // self.layout(this.get('fitView'));
    }
  }

  removeChild(id) {}

  updateChild(data, parentId) {}
}

export const treeGraph = new TreeGraph();
