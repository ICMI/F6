import { Component, Fragment } from '@antv/f-engine';
import { edgesActions, layoutActions, nodesActions, viewActions } from '../../store';
import { connector } from './connector';
import { Node } from './node';
import { Edge } from './edge';

@connector(
  (state) => {
    return {
      nodeIds: Object.values(state.nodes.ids),
      edgeIds: Object.values(state.edges.ids),
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
        dispatch(layoutActions.layoutAsync(layout));
      },
    };
  },
)
export class GraphRoot extends Component {
  didMount() {
    const { initGraphData } = this.props;
    initGraphData(this.context.root.props);
  }

  render() {
    const { nodeIds, edgeIds } = this.props;
    return (
      <Fragment>
        {[...nodeIds, ''].map((id) => (
          <Node id={id} key={id}></Node>
        ))}
        {[...edgeIds, ''].map((id) => (
          <Edge id={id} key={id}></Edge>
        ))}
      </Fragment>
    );
  }
}
