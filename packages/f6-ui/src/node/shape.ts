import UINode from './node';

export default class UIShapeNode extends UINode {
  getAttrs() {
    const style = this.style;
    const dom = this.dom;
    return {
      fill: style.backgroundColor,
      lineWidth: style.borderWidth,
      fillOpacity: style.backgroundOpacity,
      stroke: style.borderColor,
      width: this.width - (style.borderWidth || 0),
      height: this.height - (style.borderWidth || 0),
      ...dom.attrs,
    };
  }

  draw(parentGNode) {
    const attrs = this.getAttrs();

    const dom = this.dom;
    if (!this.gNode) this.gNode = parentGNode.addShape(dom.attrs.type, { attrs });
    this.update();
  }
  update() {
    const attrs = this.getAttrs();
    let shape = this.gNode;
    const isCapture = this.style.pointerEvents === 'none' ? false : true;
    shape.attr(attrs);
    shape.set('capture', isCapture);
    shape.resetMatrix();
    shape.translate(this.left, this.top);
    typeof this.style?.zIndex === 'number' && shape.setZIndex(this.style.zIndex);
  }
}
