//@ts-nocheck

import { jsx, Component } from '@antv/f-engine';
import { calcBBox, calcMatrix, calculateBBox } from '../adapter/element';
import { getNode } from './components/nodes';
import { connect, connector } from './connector';

@connect((graph, props, prevProps) => {
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
    states: [...node.states],
    setPosition: node.setPosition.bind(node),
  };
})
export class Node extends Component {
  nodeRef = { current: null };
  cacheBBox = null;
  isAnimating = false;

  prevPosition = {};

  shouldUpdate(_nextProps: any): void {
    return !this.isAnimating;
  }

  willMount(): void {
    const { inject } = this.props;
    inject('getBBox', this.getBBox);
    inject('getAnchorPoints', this.getAnchorPoints);
  }

  didMount(): void {
    const { node, item } = this.props;
    // const Shape = getNode(node?.type);
    // const defaultStyle = this.getShapeNode()?.getOptions();
    // const anchorPoints = this.getShapeNode()?.getAnchorPoints(node) || [];
    // this.syncKeyShapeBBox({ ...defaultStyle, anchorPoints });
    this.container.item = item;
  }

  didUpdate(): void {
    this.cacheBBox = null;
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

  getAnchorPoints = () => {
    const { node } = this.props;
    return this.getShapeNode()?.getAnchorPoints(node);
  };

  onFrame = () => {
    this.isAnimating = true;
    const { setPosition, id } = this.props;
    let { x, y } = this.getNodeRoot().style;
    if (typeof x === 'string') {
      x = Number(x.replace('px', ''));
    }
    if (typeof y === 'string') {
      y = Number(y.replace('px', ''));
    }

    setPosition({ x, y });
  };

  onEnd = () => {
    this.isAnimating = false;
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
    node.label = node.id;
    return (
      <Shape
        node={node}
        animation={{
          appear,
          update,
          end,
        }}
        onFrame={this.onFrame}
        onEnd={this.onEnd}
        ref={this.nodeRef}
        states={states}
      ></Shape>
    );
  }
}
