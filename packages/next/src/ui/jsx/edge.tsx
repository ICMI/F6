//@ts-nocheck
import { jsx, Component } from '@antv/f-engine';
import { isEqual } from '@antv/util';
import { getEdge } from './components/edges';
import { connect, connector } from './connector';

@connect((graph, props) => {
  const edge = graph.edgeManager.byId(props.id);

  if (!edge) {
    return false;
  }

  return {
    sourceNode: edge.getNodeEntity(edge.model.source),
    targetNode: edge.getNodeEntity(edge.model.target),
    linkCenter: false,
    edge: edge.model,
    inject: edge.inject.bind(edge),
    getEndCenter: edge.getEndCenter.bind(edge),
    getLinkPoint: edge.getLinkPoint.bind(edge),
    getControlPointsByCenter: edge.getControlPointsByCenter.bind(edge),
  };
})
export class Edge extends Component {
  edgeShapeRef = { current: null };

  willMount(): void {
    const { inject } = this.props;
    inject('getControlPoints', this.getControlPoints);
  }

  getShapeEdge() {
    return this.edgeShapeRef.current;
  }

  getPoints() {
    const {
      updateEdgePoints,
      edge,
      linkCenter,
      getEndCenter,
      getControlPointsByCenter,
      getLinkPoint,
    } = this.props;
    if (!edge) return;
    let startPoint, endPoint;
    if (linkCenter) {
      startPoint = getEndCenter('source', edge.id);
      endPoint = getEndCenter('target', edge.id);
    } else {
      const controlPoints = edge.controlPoints || getControlPointsByCenter(edge.id);
      startPoint = getLinkPoint('source', edge, controlPoints);
      endPoint = getLinkPoint('target', edge, controlPoints);
    }
    return {
      startPoint,
      endPoint,
    };
  }

  getControlPoints = (cfg) => {
    return this.getShapeEdge()?.getControlPoints(cfg);
  };

  render() {
    const { updateEdgePoints, edge, linkCenter } = this.props;
    const Shape = getEdge(edge?.type || 'line');

    if (!Shape) {
      console.warn('不存在对应的 Node Shape');
      return null;
    }

    if (!edge) {
      return null;
    }

    const points = this.getPoints();

    if (Number.isNaN(points.startPoint.x) || Number.isNaN(points.endPoint)) {
      return null;
    }

    return <Shape edge={{ ...edge, ...points }} ref={this.edgeShapeRef}></Shape>;
  }
}
