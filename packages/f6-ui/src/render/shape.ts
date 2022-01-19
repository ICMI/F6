import RenderNode from './base';
import { typeParser } from '../utils';

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
    const transfomAttrs: any = {};

    for (const [key, value] of Object.entries(attributes)) {
      console.log(key, value);
      transfomAttrs[key] = typeParser(value);
    }

    const attrs = this.getAttrs(transfomAttrs, style);

    if (!this.cacheNode) this.cacheNode = parentGNode.addShape(transfomAttrs.type, { attrs });

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
