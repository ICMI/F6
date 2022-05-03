export const calcBBox = (ele) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const stack = [ele];
  while (stack.length) {
    const ele = stack.pop();
    if (ele.config.type !== 'g') {
      const gBBox = ele.getLocalBounds();
      let { lineWidth = 0 } = ele.style;

      if (!ele.attr('stroke')) {
        lineWidth = 0;
      }
      const halfLineWidth = lineWidth / 2;
      const [gMinX, gMinY] = gBBox.getMin();
      const [gMaxX, gMaxY] = gBBox.getMax();

      minX = Math.min(minX, gMinX - halfLineWidth);
      maxX = Math.max(maxX, gMaxX + halfLineWidth);
      minY = Math.min(minY, gMinY - halfLineWidth);
      maxY = Math.max(maxY, gMaxY + halfLineWidth);
    }
    stack.push(...ele.getChildren());
  }
  return {
    x: minX,
    y: minY,
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
