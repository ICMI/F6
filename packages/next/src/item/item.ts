import { makeObservable, observable } from 'mobx';

export class Item {
  model = {};

  constructor() {
    makeObservable(this, {
      model: observable,
    });
  }

  get type() {
    return 'item';
  }

  get id() {
    return this.model.id;
  }

  set id(id) {
    if (typeof id === 'number' || typeof id === 'string') this.model[id] = id;
  }

  updateItem(model) {
    this.model = { ...this.model, ...model };
  }
}
