export function getInitState() {
  return {
    width: 100,
    height: 100,
    devicePixelRatio: 1,
    // 横竖屏等
    // 自适应等
  };
}

export function initView(state, action) {
  const { width, height, devicePixelRatio } = action.payload;
  state.width = width;
  state.height = height;
  state.devicePixelRatio = devicePixelRatio;
}
