import { action, makeObservable, observable } from 'mobx';
import { Item } from '../item/item';
import { ItemManger } from '../item/manager';

export class Hull extends Item {
  model = {};

  constructor(model) {
    super();
    this.model = { ...model };
  }

  get type() {
    return 'hull';
  }
}

export class HullManager extends ItemManger {
  createItem(data: any): Item {
    return new Hull(data);
  }
}
