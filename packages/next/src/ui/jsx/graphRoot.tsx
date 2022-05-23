import { jsx, Component, Fragment } from '@antv/f-engine';

import { node, edge, view, combo, hull, layout as layoutActions, graph } from '../../store';
import { connector } from './connector';
import { Node } from './node';
import { Edge } from './edge';
import { COMBO_Z_INDEX, EDGE_Z_INDEX, HULL_Z_INDEX, NODE_Z_INDEX } from '../../const';
import { getSortedCombos } from '../../selector/combo';
import { Combo } from './combo';
import { Hull } from './hull';
import { calcBBox, getMatrix } from '../../selector/node';

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
      initGraphData: ({ width, height, devicePixelRatio }) => {
        const { data } = props;
        view.init({
          width,
          height,
          devicePixelRatio,
        });
        node.init(data.nodes);
        edge.init(data.edges);
        combo.init(data.combos || []);
        hull.init(data.hulls || []);
        layoutActions.layout();
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
  nodeRoot = null;
  edgeRoot = null;
  comboRoot = null;
  hullRoot = null;

  findAllByState() {}

  didMount() {
    const { initGraphData } = this.props;
    initGraphData(this.context.root.props);
    // 初始化 event service

    // 遍历 behavior 加事件
  }

  didUpdate(): void {
    this.nodeRoot.container.style.zIndex = NODE_Z_INDEX;
    this.edgeRoot.container.style.zIndex = EDGE_Z_INDEX;
    this.comboRoot.container.style.zIndex = COMBO_Z_INDEX;
    this.hullRoot.container.style.zIndex = HULL_Z_INDEX;
    const { translate, scale, rotate } = this.props.graph;
    this.container.style.transform = `translate3d(${translate[0]}px, ${translate[1]}px, ${translate[2]}px) scale3d(${scale[0]}, ${scale[1]}, ${scale[2]}) rotate(${rotate}deg)`;

    graph.syncMatrix(getMatrix(this.container));
    graph.syncBBox(calcBBox(this.container));
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
