import { jsx, Component } from '@antv/f-engine';
import { connector } from './connector';

@connector((state, props) => {
  return {
    edge: state.edges.entities[props.id],
  };
})
export class Edge extends Component {
  render() {
    const { edge } = this.props;
    return (
      <group>
        <circle
          style={{
            r: 20,
            fill: '#000',
          }}
        ></circle>
      </group>
    );
  }
}
