import { jsx, Component, AdapterHammer } from '@antv/f-engine';
import { createGlobalContext, getGlobalContext, GlobalContext } from '../../service';
import { GraphRoot } from './graphRoot';
import { TreeGraph as RootStore } from '../../graph/treeGraph';
export class TreeGraph extends Component {
  hammer = null;

  willMount(): void {
    this.hammer = new AdapterHammer(this.context.canvas);

    const graph = new RootStore();
    graph.eventService.initEvents();
    graph.eventService.canvas = this.context.canvas;

    this.hammer.on('*', graph.eventService.canvasHandler);

    this.context.graph = graph;
  }

  render() {
    return <GraphRoot {...this.props}></GraphRoot>;
  }
}
