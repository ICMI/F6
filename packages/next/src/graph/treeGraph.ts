import { each, extend, uniqueId } from '@antv/util';
import { formatPadding } from '../utils';
import { ext } from '@antv/matrix-util';
import { getGlobalContext } from '../service';
import { Graph } from './graph';
import { traverseTreeUp } from '../utils/graphic';
import Hierarchy from '@antv/hierarchy';

const { transform } = ext;

export class TreeGraph extends Graph {
  originData = {};
  rootId = null;
  layoutCfg = {};

  init(props) {
    const { data, layout } = props;
    this.originData = data;
    let nodes = [];
    let edges = [];

    const stack = [[null, data]];
    while (stack.length) {
      for (let i = 0, len = stack.length; i < len; i++) {
        const [parent, node] = stack.pop();
        node.id = node.id || uniqueId();
        nodes.push({ ...node, parent });
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

    this.rootId = data.id;
    this.layoutCfg = layout;
    super.init({ ...props, data: { nodes, edges } });
  }

  /**
   * 向🌲树中添加数据
   * @param treeData 树图数据
   * @param parent 父节点实例
   * @param animate 是否开启动画
   */
  private innerAddChild(treeData, parentData) {
    const stack = [[parentData, treeData]];
    let nodes = [];
    let edges = [];
    while (stack.length) {
      const [parentData, node] = stack.pop();
      for (let i = 0, len = stack.length; i < len; i++) {
        node.id = node.id || uniqueId();
        nodes.push({ ...node, parentData });
        parentData &&
          edges.push({
            source: parentData.id,
            target: node.id,
          });
        node.children &&
          node.children.forEach((child) => {
            stack.push([node, child]);
          });
      }
    }
    this.addItem('node', nodes);
    this.addItem('edge', edges);
  }

  /**
   * 删除子节点Item对象
   * @param id
   * @param to
   * @param animate
   */
  private innerRemoveChild(id: string) {
    const model = this.getItem(id)?.model;
    traverseTreeUp(model, (child) => {
      if (!child) {
        return true;
      }
      this.removeItem(child.id);
      return true;
    });
  }

  innerUpdateChild(data) {
    const stack = [[null, data]];
    while (stack.length) {
      for (let i = 0, len = stack.length; i < len; i++) {
        const [parent, node] = stack.pop();
        const current = this.getItem(node.id);

        if (!current) {
          this.innerAddChild(node, current.model);
          continue;
        }

        this.updateItem(current, node);

        const currentChildren = current.model.children;
        if (currentChildren) {
          for (let i = currentChildren.length - 1; i > 0; i--) {
            const child = currentChildren[i];
            const node = this.findDataById(child.id);
            if (!node) {
              this.innerRemoveChild(node.id);
            }
          }
        }

        node.children &&
          node.children.forEach((child) => {
            stack.push([node, child]);
          });
      }
    }
  }

  findDataById(id: string, parent = this.originData) {
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
    this.layout();
  }

  /**
   * 返回指定节点在树图数据中的索引
   * @param children 树图数据
   * @param child 树图中某一个 Item 的数据
   */
  private static indexOfChild(children: TreeGraphData[], id: string): number {
    let index = -1;
    // eslint-disable-next-line consistent-return
    each(children, (former, i) => {
      if (id === former.id) {
        index = i;
        return false;
      }
    });
    return index;
  }

  removeChild(id) {
    const self = this;
    const node = self.getItem(id);

    if (!node) {
      return;
    }

    const parent = node.getParent();
    if (parent && !parent.destroyed) {
      const parentNode = self.findDataById(parent.id, this.originData);
      const siblings = (parentNode && parentNode.children) || [];
      const model = node.model;

      const index = TreeGraph.indexOfChild(siblings, model.id);
      siblings.splice(index, 1);
    }
    self.layout();
  }

  /**
   * 更新源数据，差量更新子树
   * @param {TreeGraphData} data 子树数据模型
   * @param {string} parentId 子树的父节点id
   */
  public updateChild(data: TreeGraphData, parentId?: string): void {
    const self = this;

    // 如果没有父节点或找不到该节点，是全量的更新，直接重置data
    if (!parentId || !self.getItem(parentId)) {
      // self.changeData(data);
      return;
    }

    const parentModel = self.findDataById(parentId, this.originData) as NodeConfig;

    const current = self.getItem(data.id);

    if (!parentModel.children) {
      // 当 current 不存在时，children 为空数组
      parentModel.children = [];
    }

    // 如果不存在该节点，则添加
    if (!current) {
      parentModel.children.push(data);
    } else {
      const index = TreeGraph.indexOfChild(parentModel.children, data.id);
      parentModel.children[index] = data;
    }
    self.layout();
  }

  getLayout() {
    const layout = this.layoutCfg;
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

  layout(): void {
    const layout = this.getLayout();
    const layoutData = layout(this.originData, this.layoutCfg);

    this.innerUpdateChild(layoutData);
  }

  public changeData(data?: GraphData | TreeGraphData): any {
    const self = this;

    // 更改数据源后，取消所有状态
    // this.getNodes().map((node) => self.clearItemStates(node));
    // this.getEdges().map((edge) => self.clearItemStates(edge));

    if (data) {
      this.originData = data;
      // self.data(data);
      // self.render();
    }
  }
}

export const treeGraph = new TreeGraph();
