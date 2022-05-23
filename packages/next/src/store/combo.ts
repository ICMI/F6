import { computed, injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { updateMany, updateOne } from './entityHelper';
import { node } from './node';

export class Combo {
  state = {
    entities: {},
    ids: [],
  };

  node = node;

  @injectTrigger
  init(data, state?) {
    data?.forEach((node) => {
      node.id = node.id || uuid();
      node.type = node.type || 'circle';
      node.visible = true;
      node.__type = 'combo';
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

  @computed((self) => [self.state.ids, self.node.state.ids])
  sortedCombos() {
    const combos = Object.values(this.state.entities);
    const nodes = Object.values(this.node.state.entities);
    // 邻接
    const combosMap = {};
    combos.forEach((combo) => {
      combosMap[combo.id] = { ...combo };
    });

    // 转树
    const tree = [];
    for (const [key, value] of Object.entries(combosMap)) {
      if (typeof combosMap[key].parentId === 'undefined') {
        tree.push(value);
      } else {
        const parent = combosMap[value.parentId];
        parent.combos = [...(parent.combos || []), value];
      }
    }

    // 广度 + 计算depth + reverse = 节点从叶子向根排序
    const stack = [[{ combos: tree }, 0]];
    let combosSorted = [];
    while (stack.length !== 0) {
      for (let i = 0, len = stack.length; i < len; i++) {
        let [node, depth] = stack.shift();
        const nextDepth = depth + 1;
        node.combos?.forEach((child) => {
          child.depth = nextDepth;
          combosSorted.push(child);
          stack.push([child, nextDepth]);
        });
      }
    }
    combosSorted = combosSorted.reverse();

    // 添加node子节点依赖
    nodes.forEach((node) => {
      const combo = combosMap[node.comboId];
      if (combo) {
        combo.nodes = [...(combo.nodes || []), node];
      }
    });
    combosSorted.forEach(
      (combo) => (combo.children = [...(combo.nodes || []), ...(combo.combos || [])]),
    );

    return combosSorted;
  }

  @computed((self) => [self.sortedCombos])
  getCombo(comboId) {
    const combos = this.sortedCombos();
    for (const combo of combos) {
      if (combo.id === comboId) return combo;
    }
  }
}

export const combo = new Combo();

export const { init } = combo;
