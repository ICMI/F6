import { Component } from '@antv/f-engine';

export class BaseNode extends Component {
  keyShapeRef = { current: null };
  getKeyShape() {
    return this.keyShapeRef.current || this.getRootShape();
  }
  getRootShape() {
    return this.container.children[0];
  }
  getAnchorPoints(state) {
    return state.anchorPoints;
  }
}
