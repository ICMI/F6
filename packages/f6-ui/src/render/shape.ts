import RenderNode from './base';
export default class RenderNodeShape extends RenderNode {
  getAttrs(attributes, style, layout) {
    return {
      fill: style.backgroundColor,
      lineWidth: style.borderWidth,
      fillOpacity: style.backgroundOpacity,
      stroke: style.borderColor,
      width: layout.width - (style.borderWidth || 0),
      height: layout.height - (style.borderWidth || 0),
      ...attributes,
    };
  }

  draw(parentGNode, attributes, style, layout) {
    const attrs = this.getAttrs(attributes, style, layout);

    if (!this.cacheNode) this.cacheNode = parentGNode.addShape(attributes.type, { attrs });
    let shape = this.cacheNode;
    const isCapture = style.pointerEvents === 'none' ? false : true;
    shape.attr(attrs);
    shape.set('capture', isCapture);
    shape.resetMatrix();
    shape.translate(layout.left, layout.top);
    typeof style?.zIndex === 'number' && shape.setZIndex(style.zIndex);
  }
}
