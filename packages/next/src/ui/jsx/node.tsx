import { jsx, Component } from '@antv/f-engine';
import { calcBBox, calcMatrix, calculateBBox } from '../adapter/element';
import { node as nodesActions, store } from '../../store';
import { animate } from '../../store/animate';
import { state } from '../../store/state';
import { getNode } from './components/nodes';
import { connect, connector } from './connector';

@connect((graph, props) => {
  const node = graph.nodeManager.byId(props.id);
  if (!node) {
    return;
  }
  return {
    item: node,
    node: node.model,
    inject: node.inject.bind(node),
    // appear: animate.getAppear(props.id),
    // update: animate.getUpdate(props.id),
    // end: animate.getEnd(props.id),
    states: node.states,
  };
})
export class Node extends Component {
  nodeRef = { current: null };
  cacheBBox = null;

  willMount(): void {
    const { inject } = this.props;
    inject('getBBox', this.getBBox);
    inject('getAnchorPoints', this.getAnchorPoints);
  }

  getModel() {
    return this.props.node;
  }
  hasLocked() {
    return false;
  }
  get(key) {
    return this.props.node[key];
  }
  getType() {
    return 'node';
  }

  getBBox = () => {
    const { node } = this.props;
    if (!node) return;
    let matrix = calcMatrix(this.getNodeRoot());
    return calculateBBox(calcBBox(this.getKeyShape()), matrix);
  };

  getShapeNode() {
    return this.nodeRef.current;
  }

  getKeyShape() {
    return this.nodeRef.current?.getKeyShape();
  }

  getNodeRoot() {
    return this.nodeRef.current?.getRootShape();
  }

  didMount(): void {
    const { node, item } = this.props;
    // const Shape = getNode(node?.type);
    // const defaultStyle = this.getShapeNode()?.getOptions();
    // const anchorPoints = this.getShapeNode()?.getAnchorPoints(node) || [];
    // this.syncKeyShapeBBox({ ...defaultStyle, anchorPoints });
    this.container.item = item;

    // setInterval(() => {
    //   this.setState({
    //     node: { ...this.props.node, ...{ x: Math.random(), y: Math.random() } },
    //   });
    // }, 500);
  }

  getAnchorPoints = () => {
    const { node } = this.props;
    return this.getShapeNode()?.getAnchorPoints(node);
  };

  didUpdate(): void {
    this.cacheBBox = null;
  }

  onFrame = () => {
    const { updateNode, id } = this.props;
    let { x, y } = this.getNodeRoot().style;
    y = typeof y === 'string' ? Number(y.replace('px', '')) : y;
    // updateNode({ x, y });
  };

  render() {
    const { node, appear, update, end, states } = this.props;
    this.container.setAttribute('state', node);
    this.container.setAttribute('id', node?.id);
    const Shape = getNode(node?.type);
    if (!Shape) {
      console.warn('不存在对应的 Node Shape');
      return null;
    }
    console.log(states.length);
    return (
      <Shape
        node={node}
        animation={{
          appear,
          update,
          end,
        }}
        onFrame={this.onFrame}
        ref={this.nodeRef}
        states={states}
      ></Shape>
    );
  }
}
