import { jsx, Component, Fragment } from '@antv/f-engine';

import { node, edge, view, combo, hull, layout as graphLayout, graph, store } from '../../store';
import { connector } from './connector';
import { Node } from './node';
import { Edge } from './edge';
import { COMBO_Z_INDEX, EDGE_Z_INDEX, HULL_Z_INDEX, NODE_Z_INDEX } from '../../const';

import { calcBBox, calcCanvasBBox, calcMatrix, getMatrix, setMatrix } from '../adapter/element';
import { Combo } from './combo';
import { Hull } from './hull';

@connector(
  (state) => {
    return {
      nodeIds: state.node.state.ids,
      edgeIds: state.edge.state.ids,
      sortedCombos: combo.sortedCombos(),
      hullIds: state.hull.state.ids,
      graph: state.graph.state,
    };
  },
  (dispatch, props) => {
    return {
      initGraphData: (props) => {
        graph.initGraph(props);
      },
      initTreeGraph(props) {
        graph.initTreeGraph(props);
      },
      updateNodes(nodes) {
        node.updateMany(nodes);
      },
      updateEdges(edges) {
        edge.updateMany(edges);
      },
    };
  },
)
export class GraphRoot extends Component {
  comboRefMap = {};
  nodesRefMap = {};
  edgesRefMap = {};
  nodeRoot = null;
  edgeRoot = null;
  comboRoot = null;
  hullRoot = null;
  willMount(): void {
    node.inject('getBBox', this.getNodeBBox);
    combo.inject('getBBox', this.getNodeBBox);
    node.inject('getAnchorPoints', this.getNodeAnchorPoints);
    edge.inject('getControlPoints', this.getEdgeControlPoints);
    graph.inject('getCanvasBBox', this.getRootBBox);
    graph.inject('getMatrix', this.getRootMatrix);
  }

  didMount() {
    const { initGraphData, isTreeGraph, initTreeGraph, data, layout } = this.props;
    const { width, height, devicePixelRatio } = this.context.root.props;

    if (isTreeGraph) {
      initTreeGraph({ width, height, devicePixelRatio, data, layout });
    } else {
      initGraphData({ width, height, devicePixelRatio, data, layout });
    }

    // 初始化 event service

    // 遍历 behavior 加事件
  }

  didUpdate(): void {
    this.nodeRoot && (this.nodeRoot.container.style.zIndex = NODE_Z_INDEX);
    this.edgeRoot && (this.edgeRoot.container.style.zIndex = EDGE_Z_INDEX);
    this.comboRoot && (this.comboRoot.container.style.zIndex = COMBO_Z_INDEX);
    this.hullRoot && (this.hullRoot.container.style.zIndex = HULL_Z_INDEX);
    const { matrix } = this.props.graph;
    // graph.syncMatrix(getMatrix(this.container));
    // graph.syncBBox(calcBBox(this.container));
    setMatrix(this.container, matrix);
    graphLayout.layout();

    // graph.fitView();
  }

  updateBBox() {}

  getNodeBBox = (id) => {
    return this.nodesRefMap[id]?.getBBox() || this.comboRefMap[id]?.getBBox();
  };

  getNodePosition = (id) => {
    return this.comboRefMap[id]?.getPosition();
  };

  getNodeAnchorPoints = (id) => {
    return this.nodesRefMap[id]?.getAnchorPoints() || this.comboRefMap[id]?.getAnchorPoints();
  };

  getEdgeControlPoints = (id, cfg) => {
    return this.edgesRefMap[id]?.getControlPoints(cfg);
  };

  getRootBBox = () => {
    return calcCanvasBBox(this.container);
  };

  getRootMatrix = () => {
    return getMatrix(this.container);
  };

  render() {
    const { nodeIds, edgeIds, sortedCombos, hullIds } = this.props;
    if (nodeIds.length === 0 || edgeIds.length === 0) return null;
    return (
      <Fragment>
        <Fragment
          ref={(instance) => {
            this.nodeRoot = instance;
          }}
        >
          {[...nodeIds].map((id) => (
            <Node
              id={id}
              key={id}
              forwardRef={(instance) => {
                this.nodesRefMap[id] = instance;
              }}
            ></Node>
          ))}
        </Fragment>
        <Fragment ref={(instance) => (this.comboRoot = instance)}>
          {sortedCombos.map((sortedCombo) => (
            <Combo
              id={sortedCombo.id}
              key={sortedCombo.id}
              sortedCombo={sortedCombo}
              forwardRef={(instance) => {
                this.comboRefMap[sortedCombo.id] = instance;
              }}
              getNodeBBox={this.getNodeBBox}
            ></Combo>
          ))}
        </Fragment>

        <Fragment ref={(instance) => (this.edgeRoot = instance)}>
          {[...edgeIds].map((id) => (
            <Edge
              id={id}
              key={id}
              getNodeBBox={this.getNodeBBox}
              getNodePosition={this.getNodePosition}
              getNodeAnchorPoints={this.getNodeAnchorPoints}
              forwardRef={(instance) => {
                this.edgesRefMap[id] = instance;
              }}
            ></Edge>
          ))}
        </Fragment>
        <Fragment ref={(instance) => (this.hullRoot = instance)}>
          {hullIds.map((id) => (
            <Hull id={id} key={id} getNodeBBox={this.getNodeBBox}></Hull>
          ))}
        </Fragment>
      </Fragment>
    );
  }
}
