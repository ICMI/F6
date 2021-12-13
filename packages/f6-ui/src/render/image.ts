import RenderNode from './base';

export default class RenderNodeImage extends RenderNode {
  draw(parentGNode, attributes, style) {
    const attrs = {
      x: style.left,
      y: style.top,
      img: attributes.src,
      width: style.width || 0,
      height: style.height || 0,
    };

    const isCapture = style.pointerEvents === 'none' ? false : true;
    if (!this.cacheNode) {
      this.cacheNode = parentGNode.addShape('image', {
        type: 'image',
        attrs,
        capture: isCapture,
      });
    }

    const shape = this.cacheNode;

    shape.resetMatrix();

    shape.set('capture', isCapture);

    shape.attr(attrs);
    // zIndex
    typeof style.zIndex === 'number' && shape.setZIndex(style.zIndex);

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
}
