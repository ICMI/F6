//@ts-nocheck

import { jsx, Component, Fragment, renderShape } from '@antv/f-engine';

import { connect, connector } from './connector';
import { Node } from './node';
import { Edge } from './edge';
import { COMBO_Z_INDEX, EDGE_Z_INDEX, HULL_Z_INDEX, NODE_Z_INDEX } from '../../const';

import { calcBBox, calcCanvasBBox, calcMatrix, getMatrix, setMatrix } from '../adapter/element';
import { Combo } from './combo';
import { Hull } from './hull';

@connect((graph, props) => {
  return {
    nodes: graph.nodeManager.models,
    edges: graph.edgeManager.models,
    sortedCombos: graph.comboManager.sortedCombos,
    hulls: graph.hullManager.models,
    matrix: graph.matrix,
    nodeStates: graph.nodeManager.states,
    edgeStates: graph.edgeManager.states,
    comboStates: graph.comboManager.states,
    isAutoSize: graph.comboManager.isAutoSize,
  };
})
export class GraphRoot extends Component {
  nodeRoot = null;
  edgeRoot = null;
  comboRoot = null;
  hullRoot = null;
  isFitViewed = false;

  willMount(): void {
    this.context.graph.inject('getCanvasBBox', this.getRootBBox);
    this.context.graph.inject('getMatrix', this.getRootMatrix);
  }

  didMount() {
    const { data, layout, modes } = this.props;
    const { width, height, devicePixelRatio } = this.context.root.props;

    this.context.graph.init({ width, height, devicePixelRatio, data, layout, modes });

    this.context.graph.layout();
  }

  didUpdate(): void {
    this.nodeRoot && (this.nodeRoot.container.style.zIndex = NODE_Z_INDEX);
    this.edgeRoot && (this.edgeRoot.container.style.zIndex = EDGE_Z_INDEX);
    this.comboRoot && (this.comboRoot.container.style.zIndex = COMBO_Z_INDEX);
    this.hullRoot && (this.hullRoot.container.style.zIndex = HULL_Z_INDEX);
    const { matrix } = this.props;
    // graph.syncMatrix(getMatrix(this.container));
    // graph.syncBBox(calcBBox(this.container));
    setMatrix(this.container, matrix);

    // fitView
    !this.isFitViewed && this.context.graph.fitView();
    this.isFitViewed = true;
  }

  getRootBBox = () => {
    return calcCanvasBBox(this.container);
  };

  getRootMatrix = () => {
    return getMatrix(this.container);
  };

  render() {
    const {
      nodes,
      edges,
      combos,
      sortedCombos,
      hulls,
      nodeStates,
      edgeStates,
      comboStates,
      isAutoSize,
    } = this.props;
    const graph = this.context.graph;
    if (!nodes || nodes.length === 0) return null;
    return (
      <Fragment>
        <Fragment
          ref={(instance) => {
            this.nodeRoot = instance;
          }}
        >
          {[...nodes].map((node, index) => (
            <Node
              key={node.id}
              node={node}
              states={nodeStates[index]}
              item={graph.getItem(node.id)}
            ></Node>
          ))}
        </Fragment>
        <Fragment ref={(instance) => (this.comboRoot = instance)}>
          {sortedCombos.map((sortedCombo) => {
            const item = graph.comboManager.byId(sortedCombo.id);
            if (!item) return null;
            return (
              <Combo
                id={sortedCombo.id}
                key={sortedCombo.id}
                combo={item.model}
                sortedCombo={sortedCombo}
                item={item}
                sortedCombo={sortedCombo}
                nodes={graph.nodeManager.models.filter((node) => {
                  return sortedCombo.children?.some(({ id }) => id === node.id);
                })}
                combos={graph.comboManager.models.filter((node) => {
                  return sortedCombo.children?.some(({ id }) => id === node.id);
                })}
                states={[...item.states]}
                isAutoSize={isAutoSize}
              ></Combo>
            );
          })}
        </Fragment>

        <Fragment ref={(instance) => (this.edgeRoot = instance)}>
          {edges.map((edge, index) => {
            const item = graph.edgeManager.byId(edge.id);
            if (!item) return null;
            return (
              <Edge
                key={edge.id}
                edge={edge}
                states={nodeStates[index]}
                item={item}
                linkCenter={false}
                sourceNode={item.getSource().model}
                endNode={item.getTarget().model}
              ></Edge>
            );
          })}
        </Fragment>
        <Fragment ref={(instance) => (this.hullRoot = instance)}>
          {hulls.map((hull) => {
            const item = graph.hullManager.byId(hull.id);
            return (
              <Hull
                id={hull.id}
                key={hull.id}
                item={item}
                hull={hull}
                members={graph.nodeManager.models.filter((node) => {
                  return hull.members?.includes(node.id);
                })}
                nonMembers={graph.nodeManager.models.filter((node) => {
                  return hull.nonMembers?.includes(node.id);
                })}
              ></Hull>
            );
          })}
        </Fragment>
      </Fragment>
    );
  }
}
