import { injectTrigger } from './store';

export class Graph {
  state = {
    translate: [0, 0, 0],
    scale: [1, 1, 1],
    rotate: 0,
    canvasBBox: null,
  };

  syncState = {
    bbox: null,
  };

  @injectTrigger
  init(data, state) {
    const { width, height, devicePixelRatio } = data;
    state.width = width;
    state.height = height;
    state.devicePixelRatio = devicePixelRatio;
  }

  @injectTrigger
  translate(data, state?) {
    const { x = 0, y = 0, z = 0 } = data;
    const { translate } = state;
    state.translate = [x + translate[0], y + translate[1], z + translate[2]];
  }

  @injectTrigger
  scale(data, state?) {
    const { x = 0, y = 0, z = 0 } = data;
    state.scale = [x, y, z];
  }

  @injectTrigger
  rotate(degree = 0, state?) {
    state.rotate = degree;
  }

  syncBBox(bbox) {
    this.syncState.bbox = bbox;
  }

  syncMatrix(matrix) {
    this.syncState.matrix = matrix;
  }

  getBBox() {
    return this.syncState.bbox;
  }

  getMatrix() {
    return this.syncState.matrix;
  }

  getState() {}
}

export const graph = new Graph();

export const { init } = graph;
