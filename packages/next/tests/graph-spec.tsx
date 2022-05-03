import { Graph } from '../src';

describe('F6 Graph', () => {
  it('export', () => {
    const props = <Graph width={200} height={200} devicePixelRatio={2} renderer={'canvas'}></Graph>;

    const graph = new Graph(props);
    graph.render();
  });
});
