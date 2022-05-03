// import { store } from '../store';
import { LayoutService } from './layoutService';

export class GlobalContext {
  store = null;
  canvasContext = null;
  renderer = null;
  layoutService = null;
  constructor() {
    this.init();
  }

  init() {
    // this.setStore(store);
    this.layoutService = new LayoutService();
  }

  setStore(store) {
    // @ts-ignore
    this.store = store;
  }

  setLayoutService(layoutService) {
    this.layoutService = layoutService;
  }

  setContext(canvasContext) {
    this.canvasContext = canvasContext;
  }
  setRenderer(renderer) {
    this.renderer = renderer;
  }
}

let instance;
export const createGlobalContext = (): GlobalContext => {
  instance = new GlobalContext();
  return instance;
};

export const getGlobalContext = (): GlobalContext => {
  return instance;
};
