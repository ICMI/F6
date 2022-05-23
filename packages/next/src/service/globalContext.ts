// import { store } from '../store';
import { BehaviorService } from '../behavior';
import EventService from './eventService';
import { LayoutService } from './layoutService';
import ModeService from './modeService';

export class GlobalContext {
  store = null;
  canvasContext = null;
  renderer = null;
  layoutService = null;
  eventService = null;
  behaviorService = null;
  modeService = null;
  constructor() {
    this.init();
  }

  init() {
    // this.setStore(store);
    this.layoutService = new LayoutService();
    this.eventService = new EventService();
    this.eventService.initEvents();
    this.behaviorService = BehaviorService;
    this.modeService = new ModeService(this.behaviorService, this.eventService);
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
