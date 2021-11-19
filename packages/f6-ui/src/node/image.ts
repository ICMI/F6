import UINode from './node';

export default class UIImageNode extends UINode {
  draw(parentGNode) {
    const attrs = {
      x: this.left,
      y: this.top,
      img: this.dom.attrs.src,
      width: this.width || 0,
      height: this.height || 0,
    };

    const isCapture = this.style.pointerEvents === 'none' ? false : true;
    if (!this.gNode) {
      this.gNode = parentGNode.addShape('image', {
        type: 'image',
        attrs,
        capture: isCapture,
      });
    }

    const shape = this.gNode;

    shape.resetMatrix();

    shape.set('capture', isCapture);

    shape.attr(attrs);
    // zIndex
    typeof this.style.zIndex === 'number' && shape.setZIndex(this.style.zIndex);

    switch (this.style.textAlign) {
      case 'center':
        shape.translate(this.width / 2);
        break;
      case 'right':
        shape.translate(this.width);
        break;
      default:
        break;
    }
  }
}
