import { assembleFont, getTextHeight, ShapeAttrs } from '@antv/g-base';
import RenderNode from './base';

export default class RenderNodeText extends RenderNode {
  getAttrs(attributes, style) {
    const attrs: ShapeAttrs = {
      x: style.left,
      y: style.top,
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
      textOverflow: 'normal',
    };
    return attrs;
  }

  draw(parentGNode, attributes, style, parentStyle) {
    const attrs: ShapeAttrs = this.getAttrs(attributes, style);
    if (!this.cacheNode) {
      this.cacheNode = parentGNode.addShape('text', {
        type: 'text',
        attrs,
        capture: false,
      });
    }
    this.update(attributes, style, parentStyle);
    this.reCalcBBox({ width: style.width, height: style.height });
  }

  getMultiLineText(text, attrs, width, height) {
    const ctx = this.cacheNode.get('canvas')?.get('context');
    if (!ctx) return text;
    ctx.save();
    const font = assembleFont(attrs);
    ctx.font = font;
    if (ctx.measureText(text).width < width) return text;
    let s = '';
    let lineWidth = 0;
    const heightPerLine = getTextHeight(attrs.fontSize, attrs.lineHeight);
    let lineHeight = heightPerLine;
    const ellipseWidth = ctx.measureText('...');

    for (let value of text) {
      const valueW = ctx.measureText(value).width;
      lineWidth += valueW;
      if (lineWidth >= width) {
        lineHeight += heightPerLine;
        if (lineHeight >= height) {
          // 
          if (attrs.textOverflow === 'ellipsis') {
           
          break;
        }

        lineWidth = valueW;
        s += `\n${value}`;
      } else {
        s += value;
      }
    }

    ctx.restore();
    return s;
  }
  update(attributes, style, parentStyle) {
    const attrs: ShapeAttrs = this.getAttrs(attributes, style);
    let shape = this.cacheNode;
    shape.attr(attrs);
    shape.resetMatrix();

    switch (style.textAlign) {
      case 'center':
        shape.translate(parentStyle.width / 2);
        break;
      case 'right':
        shape.translate(parentStyle.width);
        break;
      default:
        break;
    }

    if (style.whiteSpace === 'nowrap') {
      shape.attr('text', String(attributes.innerText));
    } else {
      shape.attr(
        'text',
        this.getMultiLineText(
          String(attributes.innerText),
          attrs,
          parentStyle.width,
          parentStyle.height,
        ),
      );
    }
  }
}
