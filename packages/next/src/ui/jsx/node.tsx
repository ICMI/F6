import { jsx, Component } from '@antv/f-engine';
import { calcBBox, calcMatrix, calculateBBox } from '../../selector/node';
import { node as nodesActions } from '../../store';
import { getNode } from './components/nodes';
import { connector } from './connector';

@connector(
  (state, props) => {
    return {
      node: state.node.state.entities[props.id],
    };
  },
  (dispatch, props) => {
    return {
      updateNode(changes) {
        const { id } = props;
        nodesActions.updateOne({
          id: id,
          changes,
        });
      },
    };
  },
)
export class Node extends Component {
  nodeRef = { current: null };
  cacheBBox = null;

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
  updatePosition({ x, y }) {
    const { updateNode } = this.props;
    updateNode({ x, y });
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
    // const Shape = getNode(node?.type);
    // const defaultStyle = this.getShapeNode()?.getOptions();
    // const anchorPoints = this.getShapeNode()?.getAnchorPoints(node) || [];
    // this.syncKeyShapeBBox({ ...defaultStyle, anchorPoints });
    this.container.item = this;
  }

  getAnchorPoints = () => {
    const { node } = this.props;
    return this.getShapeNode()?.getAnchorPoints(node);
  };

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
