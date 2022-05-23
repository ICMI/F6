import { injectTrigger } from './store';

export class View {
  state = {};

  @injectTrigger
  init(data, state) {
    const { width, height, devicePixelRatio } = data;
    state.width = width;
    state.height = height;
    state.devicePixelRatio = devicePixelRatio;
  }

  getState() {}
}

export const view = new View();

export const { init } = view;
