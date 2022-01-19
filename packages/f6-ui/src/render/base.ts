export default class RenderNode {
  cacheNode = null;

  constructor(gNode?) {
    this.cacheNode = gNode;
  }

  onEventEmit(e) {}

  private addEvent() {
    this.cacheNode.on('*', (e) => {
      e.renderNode = this;
      this.onEventEmit?.(e);
    });
  }

  startDraw(parentRenderNode, attributes, style, parentStyle) {
    if (this.cacheNode) {
      this.draw(parentRenderNode.cacheNode, attributes, style, parentStyle);
    } else {
      this.draw(parentRenderNode.cacheNode, attributes, style, parentStyle);
      this.cacheNode.set('renderNode', this);
      this.addEvent();
    }
  }

  hide() {
    this.cacheNode?.set('visible', false);
    this.cacheNode?.attr('visible', false);
  }
  show() {
    this.cacheNode?.set('visible', true);
    this.cacheNode?.attr('visible', true);
  }

  draw(parentRenderNode, attributes, style, layout) {}

  // 部分渲染完后，会改变节点大小，外部注册重新布局
  onBBoxChange(obj: Record<'width' | 'height', number>) {}

  reCalcBBox({ width, height }) {
    const bbox = this.cacheNode.getBBox();
    if (width !== bbox.width || height !== bbox.height) {
      this.onBBoxChange({ width: bbox.width, height: bbox.height });
    }
  }

  remove() {
    this.cacheNode?.remove();
    this.cacheNode = null;
    this.onEventEmit = null;
  }
}
