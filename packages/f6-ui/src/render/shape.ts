import RenderNode from './base';
export default class RenderNodeShape extends RenderNode {
  getAttrs(attributes, style) {
    return {
      fill: style.backgroundColor,
      lineWidth: style.borderWidth,
      fillOpacity: style.backgroundOpacity,
      stroke: style.borderColor,
      width: style.width - (style.borderWidth || 0),
      height: style.height - (style.borderWidth || 0),
      ...attributes,
    };
  }

  draw(parentGNode, attributes, style) {
    const attrs = this.getAttrs(attributes, style);

    if (!this.cacheNode) this.cacheNode = parentGNode.addShape(attributes.type, { attrs });
    let shape = this.cacheNode;
    const isCapture = style.pointerEvents === 'none' ? false : true;
    shape.attr(attrs);
    shape.set('capture', isCapture);
    shape.resetMatrix();
    shape.translate(style.left, style.top);
    typeof style?.zIndex === 'number' && shape.setZIndex(style.zIndex);

    this.reCalcBBox({ width: style.width, height: style.height });
  }
}
