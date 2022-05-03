import { jsx, Component } from '@antv/f-engine';
import { calcBBox } from '../../selector/node';
import { nodesActions } from '../../store';
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
  didMount(): void {
    const { updateNodeBBox, node } = this.props;
    node &&
      updateNodeBBox({
        id: node.id,
        changes: {
          bbox: calcBBox(this.container.children[0]),
        },
      });
  }
  render() {
    const { node } = this.props;
    return (
      <group style={{ x: node?.x || 0, y: node?.y || 0 }}>
        <circle
          style={{
            r: 20,
            fill: '#000',
          }}
        ></circle>
        <text
          style={{
            text: node?.label,
            fill: '#fff',
            color: '#fff',
            textAlign: 'center',
          }}
        ></text>
      </group>
    );
  }
}
