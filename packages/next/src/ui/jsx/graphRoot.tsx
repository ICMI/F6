import { jsx, Component, Fragment } from '@antv/f-engine';
import {
  comboActions,
  edgesActions,
  hullActions,
  layoutActions,
  nodesActions,
  viewActions,
} from '../../store';
import { connector } from './connector';
import { Node } from './node';
import { Edge } from './edge';
import { layout } from '../../application/layout';
import { COMBO_Z_INDEX, EDGE_Z_INDEX, NODE_Z_INDEX } from '../../const';
import { getSortedCombos } from '../../selector/combo';
import { Combo } from './combo';
import { Hull } from './hull';

@connector(
  (state) => {
    return {
      nodeIds: Object.values(state.nodes.ids),
      edgeIds: Object.values(state.edges.ids),
      combos: getSortedCombos(
        Object.values(state.combo.entities),
        Object.values(state.nodes.entities),
      ),
      hullIds: Object.values(state.hull.ids),
    };
  },
  (dispatch, props) => {
    return {
      initGraphData: ({ width, height, devicePixelRatio }) => {
        const { data, layout } = props;
        dispatch(
          viewActions.initView({
            width,
            height,
            devicePixelRatio,
          }),
        );
        dispatch(nodesActions.initNodes(data.nodes));
        dispatch(edgesActions.initEdges(data.edges));
        dispatch(comboActions.initCombo(data.combos || []));
        dispatch(hullActions.initHull(data.hulls || []));
        dispatch(layoutActions.layoutAsync(layout));
      },
      updateNodes(nodes) {
        dispatch(nodesActions.updateManyNode(nodes));
      },
      updateEdges(edges) {
        dispatch(edgesActions.updateManyEdge(edges));
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

  didMount() {
    const { initGraphData } = this.props;
    initGraphData(this.context.root.props);
    console.log('didmount: ', this.nodeRoot);
    // 初始化 event service

    // 遍历 behavior 加事件
  }

  didUpdate(): void {
    this.nodeRoot.container.style.zIndex = NODE_Z_INDEX;
    this.edgeRoot.container.style.zIndex = EDGE_Z_INDEX;
    this.comboRoot.container.style.zIndex = COMBO_Z_INDEX;
  }

  updateBBox() {}

  getNodeBBox = (id) => {
    return this.nodesRefMap[id]?.getBBox() || this.comboRefMap[id]?.getBBox();
  };

  getNodePosition = (id) => {
    return this.comboRefMap[id]?.getPosition();
  };

  render() {
    const { nodeIds, edgeIds, combos, hullIds } = this.props;
    console.log(hullIds);
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
          {combos.map((combo) => (
            <Combo
              id={combo.id}
              key={combo.id}
              combo={combo}
              forwardRef={(instance) => {
                this.comboRefMap[combo.id] = instance;
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
              // forwardRef={(instance) => this.edgeRefs.push(instance)}
              getNodeBBox={this.getNodeBBox}
              getNodePosition={this.getNodePosition}
            ></Edge>
          ))}
        </Fragment>
        <Fragment>
          {hullIds.map((id) => (
            <Hull id={id} key={id} getNodeBBox={this.getNodeBBox}></Hull>
          ))}
        </Fragment>
      </Fragment>
    );
  }
}
