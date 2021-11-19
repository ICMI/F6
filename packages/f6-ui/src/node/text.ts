import UINode from './node';
import { assembleFont, ShapeAttrs } from '@antv/g-base';

export default class UITextNode extends UINode {
  getAttrs() {
    const style = this.style;
    const attrs: ShapeAttrs = {
      x: this.left,
      y: this.top,
      textAlign: this.getStyle('textAlign'),
      fill: this.getStyle('color'),
      fontSize: this.getStyle('fontSize'),
      fontStyle: this.getStyle('fontStyle'),
      fontFamily: this.getStyle('fontFamily'),
      lineHeight: style.lineHeight || 0,
      fontVariant: style.fontVariant,
      fontWeight: style.fontWeight,
      textBaseline: 'top',
      opacity: style.opacity,
      fillOpacity: style.backgroundOpacity,
    };
    return attrs;
  }

  draw(parentGNode) {
    const attrs: ShapeAttrs = this.getAttrs();
    if (!this.gNode) {
      this.gNode = parentGNode.addShape('text', {
        type: 'text',
        attrs,
        capture: false,
      });
    }
    this.update();
  }
  getMultiLineText(text, attrs, width) {
    const ctx = this.parent.gNode.get('canvas')?.get('context');
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
  update() {
    const style = this.style;
    const attrs: ShapeAttrs = this.getAttrs();
    let shape = this.gNode;
    shape.attr(attrs);
    shape.resetMatrix();
    switch (this.getStyle('textAlign')) {
      case 'center':
        shape.translate(this.width / 2);
        break;
      case 'right':
        shape.translate(this.width);
        break;
      default:
        break;
    }
    if (style.whiteSpace === 'nowrap') {
      shape.attr('text', String(this.dom.text));
    } else {
      shape.attr('text', this.getMultiLineText(String(this.dom.text), attrs, this.width));
    }
  }
}
