import { Component } from '@antv/f-engine';

export class BaseEdge extends Component {
  keyShapeRef = { current: null };
  getKeyShape() {
    return this.keyShapeRef.current || this.getRootShape();
  }
  getRootShape() {
    return this.container.children[0];
  }

  getControlPoints() {
    const { edge } = this.props;
    return edge.controlPoints;
  }
}
