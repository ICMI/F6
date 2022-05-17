import { ICanvas, IGroup, IShape } from '@antv/g-base';
import { each, wrapBehavior } from '@antv/util';
import EE from 'eventemitter3';

import { cloneEvent, isViewportChanged } from '../utils';

type Fun = () => void;

export default class EventService extends EE {
  canvasHandler!: Fun;
  canvas = null;

  protected dragging: boolean = false;

  protected preItem: Item | null = null;

  public destroyed: boolean;

  // 初始化 G6 中的事件
  protected initEvents(canvas) {
    // const canvas: ICanvas = graph.get('canvas');
    this.canvasHandler = wrapBehavior(this, 'onCanvasEvents') as Fun;
    this.canvas = canvas;
    // canvas.off('*').on('*', this.canvasHandler);
  }

  // 获取 shape 的 item 对象
  private static getItemRoot<T extends IShape>(shape: any): T {
    while (shape && !shape.item) {
      shape = shape.getParent?.();
    }
    return shape;
  }

  /**
   * 处理 canvas 事件
   * @param evt 事件句柄
   */
  protected onCanvasEvents(evt: IG6GraphEvent) {
    const canvas = this.canvas;
    const { target } = evt;
    const eventType = evt.type;

    /**
     * (clientX, clientY): 相对于页面的坐标；
     * (canvasX, canvasY): 相对于 <canvas> 左上角的坐标；
     * (x, y): 相对于整个画布的坐标, 与 model 的 x, y 是同一维度的。
     */
    evt.canvasX = evt.x;
    evt.canvasY = evt.y;
    let point = { x: evt.canvasX, y: evt.canvasY };

    // const group: IGroup = graph.get('group');
    // let matrix: Matrix = group.getMatrix();

    // if (!matrix) {
    //   matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    // }

    // if (isViewportChanged(matrix)) {
    //   point = graph.getPointByClient(evt.clientX, evt.clientY);
    // }

    // evt.x = point.x;
    // evt.y = point.y;

    // evt.currentTarget = graph;

    if (target === canvas) {
      if (eventType === 'panmove') {
        this.handleTouchMove(evt, 'canvas');
      }
      evt.target = canvas;
      evt.item = null;

      this.emit(eventType, evt);
      this.emit(`canvas:${eventType}`, evt);
      return;
    }

    const itemShape: IShape = EventService.getItemRoot(target);
    if (!itemShape) {
      this.emit(eventType, evt);
      return;
    }

    const item = itemShape.item;
    if (item.destroyed) {
      return;
    }

    const type = item.getType();

    // 事件target是触发事件的Shape实例，item是触发事件的item实例
    evt.target = target;
    evt.item = item;
    if (evt.canvasX === evt.x && evt.canvasY === evt.y) {
      // const canvasPoint = graph.getCanvasByPoint(evt.x, evt.y);
      // evt.canvasX = canvasPoint.x;
      // evt.canvasY = canvasPoint.y;
    }

    this.emit(eventType, evt);
    if (evt.name && !evt.name.includes(':')) {
      this.emit(`${type}:${eventType}`, evt);
    } else {
      this.emit(evt.name, evt);
    }

    if (eventType === 'dragstart') {
      this.dragging = true;
    }
    if (eventType === 'dragend') {
      this.dragging = false;
    }
    if (eventType === 'panmove') {
      this.handleTouchMove(evt, type);
    }
  }

  /**
   * 处理扩展事件
   * @param evt 事件句柄
   */
  // protected onExtendEvents(evt: IG6GraphEvent) {
  //   this.graph.emit(evt.type, evt);
  // }

  // /**
  //  * 在 graph 上面 emit 事件
  //  * @param itemType item 类型
  //  * @param eventType 事件类型
  //  * @param evt 事件句柄
  //  */
  // private emitCustomEvent(itemType: string, eventType: string, evt: IG6GraphEvent) {
  //   evt.type = eventType;
  //   this.graph.emit(`${itemType}:${eventType}`, evt);
  // }

  public destroy() {
    const { graph, canvasHandler, extendEvents } = this;
    const canvas: ICanvas = graph.get('canvas');

    // each(EVENTS, event => {
    //   canvas.off(event, canvasHandler);
    // });

    canvas.off('*', canvasHandler);

    each(extendEvents, (event) => {
      event.remove();
    });

    this.dragging = false;
    this.preItem = null;
    // this.extendEvents.length = 0;
    (this.canvasHandler as Fun | null) = null;
    this.destroyed = true;
  }

  /**
   * 处理移动事件
   * @param evt 事件句柄
   * @param type item 类型
   */
  private handleTouchMove(evt: IG6GraphEvent, type: string) {
    const { preItem } = this;
    const canvas: ICanvas = this.canvas;
    const item = (evt.target as any) === canvas ? null : evt.item;

    // evt = cloneEvent(evt) as IG6GraphEvent;

    // 从前一个item直接移动到当前item，触发前一个item的leave事件
    if (preItem && preItem !== item && !preItem.destroyed) {
      evt.item = preItem;
      this.emit(preItem.getType(), 'touchleave', evt);
      if (this.dragging) {
        this.emit(preItem.getType(), 'dragleave', evt);
      }
    }

    // 从一个item或canvas移动到当前item，触发当前item的enter事件
    if (item && preItem !== item) {
      evt.item = item;
      this.emit(type, 'touchenter', evt);
      if (this.dragging) {
        this.emit(type, 'dragenter', evt);
      }
    }

    this.preItem = item;
  }
}
