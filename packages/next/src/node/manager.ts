import { isNil } from '@antv/util';
import { action, makeObservable, observable } from 'mobx';
import { Item } from '../item/item';
import { ItemManger } from '../item/manager';
import { Node } from './node';

export class NodeManager extends ItemManger {
  graph = null;
  constructor(graph) {
    super();
    this.graph = graph;
  }
  createItem(data: any): Item {
    return new Node(data, this.graph);
  }

  updateById(id, model) {
    const node = this.byId(id);
    if (isNil(node)) return;
    node.update(model);
  }

  setPosition(id, position) {
    const node = this.byId(id);
    if (isNil(node)) return;
    node.setPosition(position);
  }
}
