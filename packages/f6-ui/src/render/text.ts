import { assembleFont, ShapeAttrs } from '@antv/g-base';
import RenderNode from './base';

export default class RenderNodeText extends RenderNode {
  getAttrs(attributes, style, layout) {
    console.log('text: ', layout);
    const attrs: ShapeAttrs = {
      x: layout.left,
      y: layout.top,
      textAlign: style.textAlign,
      fill: style.color,
      fontSize: style.fontSize,
      fontStyle: style.fontStyle,
      fontFamily: style.fontFamily,
      lineHeight: style.lineHeight,
      fontVariant: style.fontVariant,
      fontWeight: style.fontWeight,
      textBaseline: 'top',
      opacity: style.opacity,
      fillOpacity: style.backgroundOpacity,
    };
    return attrs;
  }

  draw(parentGNode, attributes, style, layout) {
    const attrs: ShapeAttrs = this.getAttrs(attributes, style, layout);
    if (!this.cacheNode) {
      this.cacheNode = parentGNode.addShape('text', {
        type: 'text',
        attrs,
        capture: false,
      });
    }
    this.update(attributes, style, layout);
  }
  getMultiLineText(text, attrs, width) {
    const ctx = this.cacheNode.get('canvas')?.get('context');
    if (!ctx) return text;
    ctx.save();
    const font = assembleFont(attrs);
    ctx.font = font;
    if (ctx.measureText(text).width < width) return text;
    let s = '';
    let lineWidth = 0;
    for (let value of text) {
      const valueW = ctx.measureText(value).width;
      lineWidth += valueW;
      if (lineWidth >= width) {
        lineWidth = valueW;
        s += `\n${value}`;
      } else {
        s += value;
      }
    }
    ctx.restore();
    return s;
  }
  update(attributes, style, layout) {
    const attrs: ShapeAttrs = this.getAttrs(attributes, style, layout);
    let shape = this.cacheNode;
    shape.attr(attrs);
    shape.resetMatrix();
    switch (style.textAlign) {
      case 'center':
        shape.translate(layout.width / 2);
        break;
      case 'right':
        shape.translate(layout.width);
        break;
      default:
        break;
    }
    if (style.whiteSpace === 'nowrap') {
      shape.attr('text', String(attributes.innerText));
    } else {
      shape.attr('text', this.getMultiLineText(String(attributes.innerText), attrs, layout.width));
    }
  }
}
