// @ts-nocheck
import { makeAutoObservable, observable } from 'mobx';
import { Item } from '../item/item';
import { ItemManger } from '../item/manager';
import { Edge } from './edge';
export class EdgeManager extends ItemManger {
  graph = null;

  constructor(graph) {
    super();
    this.graph = graph;
  }
  createItem(data: any): Item {
    return new Edge(data, this.graph);
  }

  getEdges(id) {
    return Object.values(this.items).filter(
      (item) => item.model.source === id || item.model.target === id,
    );
  }

  getInEdges(id) {
    return Object.values(this.items).filter((item) => item.model.source === id);
  }

  getOutEdges(id) {
    return Object.values(this.items).filter((item) => item.model.target === id);
  }
}
