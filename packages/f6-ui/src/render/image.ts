import RenderNode from './base';

export default class RenderNodeImage extends RenderNode {
  draw(parentGNode, attributes, style, layout) {
    const attrs = {
      x: layout.left,
      y: layout.top,
      img: attributes.src,
      width: layout.width || 0,
      height: layout.height || 0,
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
        shape.translate(layout.width / 2);
        break;
      case 'right':
        shape.translate(layout.width);
        break;
      default:
        break;
    }
  }
}
