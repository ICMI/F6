import { computed, injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { Node, node } from './node';
import { Entity } from './entity';

export class Combo extends Node {
  node = node;

  createOne(item: any) {
    item.visible = true;
    item.type = item.type || 'circle';
    item.__type = 'combo';
    return item;
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

  calcComboBBox(id) {
    const combo = this.getCombo(id);

    const children = [...(combo.nodes || []), ...(combo.combos || [])];

    const comboBBox = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
      x: undefined,
      y: undefined,
      width: undefined,
      height: undefined,
      centerX: undefined,
      centerY: undefined,
    };

    if (!children || children.length === 0) {
      return comboBBox;
    }

    children.forEach((node) => {
      const childBBox = this.getBBox(node.id) || node.getBBox(node.id);
      if (!childBBox) return; // ignore hidden children
      if (childBBox.x && comboBBox.minX > childBBox.minX) comboBBox.minX = childBBox.minX;
      if (childBBox.y && comboBBox.minY > childBBox.minY) comboBBox.minY = childBBox.minY;
      if (childBBox.x && comboBBox.maxX < childBBox.maxX) comboBBox.maxX = childBBox.maxX;
      if (childBBox.y && comboBBox.maxY < childBBox.maxY) comboBBox.maxY = childBBox.maxY;
    });
    comboBBox.x = (comboBBox.minX + comboBBox.maxX) / 2;
    comboBBox.y = (comboBBox.minY + comboBBox.maxY) / 2;
    comboBBox.width = comboBBox.maxX - comboBBox.minX;
    comboBBox.height = comboBBox.maxY - comboBBox.minY;

    comboBBox.centerX = (comboBBox.minX + comboBBox.maxX) / 2;
    comboBBox.centerY = (comboBBox.minY + comboBBox.maxY) / 2;

    Object.keys(comboBBox).forEach((key) => {
      if (comboBBox[key] === Infinity || comboBBox[key] === -Infinity) {
        comboBBox[key] = undefined;
      }
    });

    return comboBBox;
  }

  @injectTrigger()
  translate(data, state?) {
    super.translate(data, state);
    const { id } = data;
    const combo = this.getCombo(id);
    combo.combos?.forEach((entity) => {
      this.translate({ ...data, id: entity.id });
    });
    combo.nodes?.forEach((entity) => {
      this.node.translate({ ...data, id: entity.id });
    });
  }

  getBBox() {}

  inject(key, fn) {
    this[key] = fn;
  }
}

export const combo = new Combo();

export const { init } = combo;
