export default class RenderNode {
  cacheNode = null;

  constructor(gNode?) {
    this.cacheNode = gNode;
  }

  onEventEmit(e) {}

  private addEvent() {
    this.cacheNode.on('*', () => {
      this.onEventEmit?.(this.cacheNode);
    });
  }

  startDraw(parentRenderNode, attributes, style, layout) {
    if (this.cacheNode) {
      this.draw(parentRenderNode.cacheNode, attributes, style, layout);
    } else {
      this.draw(parentRenderNode.cacheNode, attributes, style, layout);
      this.addEvent();
    }
  }

  draw(parentRenderNode, attributes, style, layout) {}

  remove() {
    this.cacheNode?.remove();
    this.cacheNode = null;
    this.onEventEmit = null;
  }
}
