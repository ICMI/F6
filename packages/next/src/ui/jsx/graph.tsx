import { jsx, Component, AdapterHammer } from '@antv/f-engine';
import { autorun, observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { createGlobalContext, getGlobalContext, GlobalContext } from '../../service';
import { GraphRoot } from './graphRoot';
import { Graph as RootStore } from '../../graph/graph';
import { NodeManager } from '../../node/manager';

export class Graph extends Component {
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
