import { injectTrigger } from './store';
import { v4 as uuid } from 'uuid';
import { Entity } from './entity';

export class Hull extends Entity {
  createOne(item: any) {
    item.type = item.type || 'circle';
    item.visible = true;
    item.__type = 'hull';
    return item;
  }
}

export const hull = new Hull();

export const { init } = hull;
