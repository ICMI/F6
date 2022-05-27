import { jsx, Component } from '@antv/f-engine';
import { isEqual } from '@antv/util';
import { edge as edgeActions } from '../../store';
import { getEdge } from './components/edges';
import { connector } from './connector';

@connector(
  (state, props) => {
    const edge = state.edge.state.entities[props.id];

    const sourceNode =
      state.node.state.entities[edge?.source] || state.combo.state.entities[edge?.source];
    const targetNode =
      state.node.state.entities[edge?.target] || state.combo.state.entities[edge?.target];

    return {
      linkCenter: false,
      edge,
      sourceNode,
      targetNode,
    };
  },
  (dispatch) => {
    return {
      updateEdgePoints(node) {
        edgeActions.updateOne(node);
      },
    };
  },
)
export class Edge extends Component {
  edgeShapeRef = { current: null };

  getType() {
    return 'edge';
  }

  didMount(): void {}

  didUpdate(): void {}

  getShapeEdge() {
    return this.edgeShapeRef.current;
  }

  getPoints() {
    const { updateEdgePoints, edge, linkCenter } = this.props;
    if (!edge) return;
    let startPoint, endPoint;
    if (linkCenter) {
      startPoint = edgeActions.getEndCenter('source', edge.id);
      endPoint = edgeActions.getEndCenter('target', edge.id);
    } else {
      const controlPoints = edge.controlPoints || edgeActions.getControlPointsByCenter(edge.id);
      startPoint = edgeActions.getLinkPoint('source', edge, controlPoints);
      endPoint = edgeActions.getLinkPoint('target', edge, controlPoints);
    }
    return {
      startPoint,
      endPoint,
    };
  }

  getControlPoints(cfg) {
    return this.getShapeEdge()?.getControlPoints(cfg);
  }

  render() {
    const {
      updateEdgePoints,
      edge,
      linkCenter,
      sourceNode,
      targetNode,
      getNodeBBox,
      getNodePosition,
      getNodeAnchorPoints,
    } = this.props;
    const Shape = getEdge(edge?.type || 'line');

    if (!Shape) {
      console.warn('不存在对应的 Node Shape');
      return null;
    }

    if (!edge) {
      return null;
    }
    const sourcebbox = getNodeBBox(sourceNode.id);
    const targetbbox = getNodeBBox(targetNode.id);
    const sourceAnchor = getNodeAnchorPoints(sourceNode.id);
    const targetAnchor = getNodeAnchorPoints(targetNode.id);
    const sourcePosition = getNodePosition(sourceNode.id);
    const targetPosition = getNodePosition(targetNode.id);
    const points = this.getPoints();
    if (Number.isNaN(points.startPoint.x) || Number.isNaN(points.endPoint)) {
      return null;
    }

    return <Shape edge={{ ...edge, ...points }} ref={this.edgeShapeRef}></Shape>;
  }
}
