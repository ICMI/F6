//@ts-nocheck

import { jsx, Component } from '@antv/f-engine';
import { calcBBox, calcMatrix, calculateBBox } from '../adapter/element';
import { getNode } from './components/nodes';
import { connect, connector } from './connector';

export class Node extends Component {
  nodeRef = { current: null };
  cacheBBox = null;
  isAnimating = false;

  prevPosition = {};

  shouldUpdate(_nextProps: any): void {
    return !this.isAnimating || !this.props.item;
  }

  willMount(): void {
    const { item } = this.props;
    item.inject('getBBox', this.getBBox);
    item.inject('getAnchorPoints', this.getAnchorPoints);
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
    const { setPosition, id, item } = this.props;
    let { x, y } = this.getNodeRoot().style;
    if (typeof x === 'string') {
      x = Number(x.replace('px', ''));
    }
    if (typeof y === 'string') {
      y = Number(y.replace('px', ''));
    }

    item.setPosition({ x, y });
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
