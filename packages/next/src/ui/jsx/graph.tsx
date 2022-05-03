import { Component } from '@antv/f-engine';
import { createGlobalContext, getGlobalContext, GlobalContext } from '../../service';
import { GraphRoot } from './graphRoot';

export class Graph extends Component {
  constructor(props) {
    super(props);
    createGlobalContext();
  }

  willMount(): void {
    const { layout } = this.props;
    const { width, height } = this.context.root.props;
    getGlobalContext().layoutService.setLayoutConfig(layout, width, height);
  }

  render() {
    return <GraphRoot {...this.props}></GraphRoot>;
  }
}
