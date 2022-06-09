// @ts-nocheck
import { action, makeAutoObservable, makeObservable, observable } from 'mobx';
import { Node } from '../node/node';

export class Combo extends Node {
  constructor(model, graph) {
    super(model, graph);
    this.model = { ...model };
    this.model.type = model.type || 'circle';
    this.model.visible = true;
    makeObservable(this, {
      syncPosition: action.bound,
    });
  }

  syncPosition(pos) {
    this.model.x = pos.x;
    this.model.y = pos.y;
  }

  get type() {
    return 'combo';
  }
}
