import { jsx, Component } from '@antv/f-engine';
import { calcBBox, calcMatrix, calculateBBox } from '../../selector/node';
import { nodesActions } from '../../store';
import { getNode } from './components/nodes';
import { connector } from './connector';

@connector(
  (state, props) => {
    return {
      node: state.nodes.entities[props.id],
    };
  },
  (dispatch) => {
    return {
      updateNodeBBox(node) {
        dispatch(nodesActions.updateNode(node));
      },
    };
  },
)
export class Node extends Component {
  nodeRef = { current: null };
  cacheBBox = null;

  syncKeyShapeBBox(style = {}) {
    const { updateNodeBBox, node } = this.props;
    if (!node) return;
    // let matrix = calcMatrix(this.getNodeRoot());
    // const keyShapeBBox = calculateBBox(calcBBox(this.getKeyShape()), matrix);

    updateNodeBBox({
      id: node.id,
      changes: {
        ...style,
      },
    });
  }

  getBBox() {
    if (this.cacheBBox) return this.cacheBBox;

    const { node } = this.props;
    if (!node) return;
    let matrix = calcMatrix(this.getNodeRoot());
    this.cacheBBox = calculateBBox(calcBBox(this.getKeyShape()), matrix);
    return this.cacheBBox;
  }

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
    const { node } = this.props;
    const Shape = getNode(node?.type);
    const defaultStyle = Shape?.getOptions();
    const anchorPoints = this.getShapeNode()?.getAnchorPoints(node) || [];
    this.syncKeyShapeBBox({ ...defaultStyle, anchorPoints });
  }

  didUpdate(): void {
    this.cacheBBox = null;
  }

  render() {
    const { node } = this.props;
    this.container.setAttribute('state', node);
    this.container.setAttribute('id', node?.id);
    const Shape = getNode(node?.type);
    if (!Shape) {
      console.warn('不存在对应的 Node Shape');
      return null;
    }
    return <Shape node={node} ref={this.nodeRef}></Shape>;
  }
}
