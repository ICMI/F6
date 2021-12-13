import { assembleFont, ShapeAttrs } from '@antv/g-base';
import RenderNode from './base';

export default class RenderNodeContainer extends RenderNode {
  backgroudNode = null;
  draw(parentGNode, attributes, style) {
    if (!this.cacheNode) {
      this.cacheNode = parentGNode.addGroup({
        id: attributes?.id,
        className: attributes.class,
      });
    }
    const gNode = this.cacheNode;

    gNode.resetMatrix();
    this.backgroudNode?.remove();
    const backgroudNode = (this.backgroudNode = gNode.addGroup());

    gNode.translate(style.left, style.top);

    // zIndex
    typeof style.zIndex === 'number' && gNode.setZIndex(style.zIndex);

    // 绘制background
    backgroudNode.addShape('rect', {
      attrs: {
        x: 0, // line绘制的时候是沿着两边扩
        y: 0,
        fill: style.backgroundColor || '#fff',
        fillOpacity: style.backgroundOpacity,
        opacity: style.opacity,
        width: style.width,
        height: style.height,
        radius: [
          style.borderTopLeftRadius || 0,
          style.borderTopRightRadius || 0,
          style.borderBottomLeftRadius || 0,
          style.borderBottomLeftRadius || 0,
        ],
        shadowBlur: style.shadowBlur || 0,
        shadowColor: style.shadowColor || null,
        shadowOffsetX: style.shadowOffsetX || 0,
        shadowOffsetY: style.shadowOffsetY || 0,
      },
      capture: style.pointerEvents === 'none' ? false : true,
    });

    if (style.backgroundImage) {
      backgroudNode.addShape('image', {
        attrs: {
          x: 0, // line绘制的时候是沿着两边扩
          y: 0,
          img: style.url,
          width: style.width,
          height: style.height,
        },
        capture: false,
      });
    }

    // 绘制边框
    const border: ShapeAttrs = {
      attrs: {
        x: (style.borderWidth || 0) / 2, // line绘制的时候是沿着两边扩
        y: (style.borderWidth || 0) / 2,
        lineWidth: style.borderWidth,
        stroke: style.borderColor,
        width: style.width - (style.borderWidth || 0),
        height: style.height - (style.borderWidth || 0),
        radius: [
          (style.borderTopLeftRadius || 0) *
            ((style.width - (style.borderWidth || 0)) / style.width),
          (style.borderTopRightRadius || 0) *
            ((style.width - (style.borderWidth || 0)) / style.width),
          (style.borderBottomLeftRadius || 0) *
            ((style.width - (style.borderWidth || 0)) / style.width),
          (style.borderBottomLeftRadius || 0) *
            ((style.width - (style.borderWidth || 0)) / style.width),
        ],
      },
      capture: false,
    };
    if (style.borderStyle === 'dashed') {
      border.attrs.lineDash = style.lineDash || [2, 2];
    }

    backgroudNode.addShape('rect', border);

    if (style.overflow === 'hidden') {
      gNode.setClip({
        type: 'rect',
        attrs: {
          width: style.width,
          height: style.height,
          radius: [
            style.borderTopLeftRadius || 0,
            style.borderTopRightRadius || 0,
            style.borderBottomLeftRadius || 0,
            style.borderBottomLeftRadius || 0,
          ],
        },
      });
    }
    backgroudNode.toBack();
  }
}
