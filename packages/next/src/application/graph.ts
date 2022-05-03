export function getInitState() {
  return {
    fitView: 'center',
    fitCenter: 'center',
    fitViewPadding: 0,
    minZoom: 0,
    maxZoom: Infinity,
    linkCenter: false,
  };
}

/**
 *
 */
export function initGraph(state, action) {
  const { data } = action.payload;
  state.fitView = state.fitView || data.fitView;
  state.fitCenter = state.fitCenter || data.fitCenter;
  state.fitViewPadding = state.fitViewPadding || data.fitViewPadding;
  state.minZoom = state.minZoom || data.minZoom;
  state.maxZoom = state.maxZoom || data.maxZoom;
  state.linkCenter = state.linkCenter || data.linkCenter;
}
