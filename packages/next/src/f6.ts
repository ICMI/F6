import { store } from './service/store';

class F6 {
  store = null;
  constructor() {
    this.store = store;
  }
}

let instance;
export const createF6 = () => {
  return new F6();
};

export const getF6 = () => {
  return instance;
};
