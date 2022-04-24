export const ACTIONS = {
  graph: {
    GRAPH_INIT: init,
  },
};

export function init({ data, store }) {
  store.state.graphData = data;
}
