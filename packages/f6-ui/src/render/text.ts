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
      textOverflow: style.textOverflow,
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

  getMultiLineText(text, attrs, width, height, isTextOverflow) {
    const ctx = this.cacheNode.get('canvas')?.get('context');
    if (!text) return text;
    const font = assembleFont(attrs);
    const fontSize = attrs.fontSize;
    let s = '';
    let lineWidth = 0;
    const heightPerLine = getTextHeight(attrs.fontSize, attrs.lineHeight);
    let lineHeight = heightPerLine;
    const ellipseWidth = this.getLetterWidth('...', fontSize, font, ctx);

    // 此处在文本数量过大时可能会有性能问题
    for (let value of text) {
      const valueW = this.getLetterWidth(value, fontSize, font, ctx);
      if (lineWidth + valueW >= width) {
        // 换行后高度超了
        if (lineHeight + heightPerLine >= height) {
          // 处理点点点
          if (isTextOverflow) {
            // 如果文字宽度 + 点点点宽度 > 整个行宽，进入循环
            while (lineWidth + ellipseWidth > width) {
              const lastLetter = s[s.length - 1];
              const lastLetterW = this.getLetterWidth(lastLetter, fontSize, font, ctx);
              // hack 至少留一个，当回退到最后一个字的时候，就break
              if (lineWidth - lastLetterW > 5) {
                // 不断回退，直至可以放下点点点
                s = s.slice(0, -1);
                lineWidth -= lastLetterW;
              } else {
                break;
              }
            }

            s += '...';
          }

          break;
        } else {
          // 单个文本宽度大于行宽度，不用在前面补个换行符
          if (s !== '') {
            s += '\n';
            lineHeight += heightPerLine;
          }
          // 把改字符拼上
          lineWidth = valueW;
          s += value;
        }
      } else {
        lineWidth += valueW;
        s += value;
      }
    }

    return s;
  }

  update(attributes, style, parentStyle) {
    const attrs: ShapeAttrs = this.getAttrs(attributes, style);
    let shape = this.cacheNode;
    shape.attr(attrs);
    shape.resetMatrix();

    const text = String(attributes.innerText.replace(/\s+/g, ' '));
    if (style.whiteSpace === 'nowrap') {
      shape.attr('text', text);
    } else {
      shape.attr(
        'text',
        this.getMultiLineText(
          text,
          attrs,
          style.width,
          style.height,
          parentStyle.textOverflow === 'ellipsis',
        ),
      );
    }
    switch (style.textAlign) {
      case 'center':
        shape.translate(style.width / 2);
        break;
      case 'right':
        shape.translate(style.width);
        break;
      default:
        break;
    }
  }

  getLetterWidth(letter, fontSize, fontStyle, ctx) {
    if (/[\u4E00-\u9FA5]+/.test(letter) || !ctx) {
      return fontSize;
    } else {
      ctx.save();
      ctx.font = fontStyle;
      const width = ctx.measureText(letter).width;
      ctx.restore();
      return width;
    }
  }
}
