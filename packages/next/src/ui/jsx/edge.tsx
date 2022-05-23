import { jsx, Component } from '@antv/f-engine';
import { isEqual } from '@antv/util';
import { getControlPointsByCenter, getEndCenter, getLinkPoint } from '../../selector/edge';
import { edge } from '../../store';
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
        edge.updateOne(node);
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

  getPoints(sourceNode, targetNode) {
    // todo 此处原有可以手动传入start Point，先忽略改功能，只从节点拿point
    const { updateEdgePoints, edge, linkCenter } = this.props;
    if (!edge || !sourceNode.keyShapeBBox) return;
    let startPoint, endPoint;
    if (linkCenter) {
      startPoint = getEndCenter('source', edge, sourceNode);
      endPoint = getEndCenter('target', edge, targetNode);
    } else {
      const controlPoints =
        edge.controlPoints ||
        this.getShapeEdge()?.getControlPoints({
          ...edge,
          startPoint: sourceNode,
          endPoint: targetNode,
        });
      startPoint = getLinkPoint(
        'source',
        { source: sourceNode, target: targetNode },
        edge,
        controlPoints,
      );
      endPoint = getLinkPoint(
        'target',
        { source: sourceNode, target: targetNode },
        edge,
        controlPoints,
      );
    }

    return {
      startPoint,
      endPoint,
    };
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
    const points = this.getPoints(
      {
        ...sourceNode,
        keyShapeBBox: sourcebbox,
        anchorPoints: sourceAnchor,
        x: typeof sourceNode.x === 'number' ? sourceNode.x : sourcePosition.x,
        y: typeof sourceNode.y === 'number' ? sourceNode.y : sourcePosition.y,
      },
      {
        ...targetNode,
        keyShapeBBox: targetbbox,
        anchorPoints: targetAnchor,
        x: typeof targetNode.x === 'number' ? targetNode.x : targetPosition.x,
        y: typeof targetNode.y === 'number' ? targetNode.y : targetPosition.y,
      },
    );

    return <Shape edge={{ ...edge, ...points }} ref={this.edgeShapeRef}></Shape>;
  }
}
