import { clone, each, wrapBehavior } from '@antv/util';
import { DragNode } from '../behavior/drag-node';
import { BehaviorOption } from '../types';

// 自定义 Behavior 时候共有的方法
export class BaseBehavior {
  getDefaultCfg() {
    return {};
  }

  /**
   * register event handler, behavior will auto bind events
   * for example:
   * return {
   *  click: 'onClick'
   * }
   */
  getEvents() {
    return {};
  }

  updateCfg(cfg: object) {
    Object.assign(this, cfg);
    return true;
  }

  shouldBegin() {
    return true;
  }

  shouldUpdate() {
    return true;
  }

  shouldEnd() {
    return true;
  }

  get(val: string) {
    return (this as any)[val];
  }

  set(key: string, val: any) {
    (this as any)[key] = val;
    return this;
  }
}

export class BehaviorService {
  // 所有自定义的 Behavior 的实例
  private static types = {};

  /**
   * 自定义 Behavior
   * @param type Behavior 名称
   * @param behavior Behavior 定义的方法集合
   */
  public static registerBehavior(type: string, behavior: BehaviorOption) {
    if (!behavior) {
      throw new Error(`please specify handler for this behavior: ${type}`);
    }

    BehaviorService.types[type] = behavior;
  }

  public static hasBehavior(type: string) {
    return !!BehaviorService.types[type];
  }

  public static getBehavior(type: string) {
    return BehaviorService.types[type];
  }

  public static bindEvents(eventService, behavior) {
    const events = behavior.getEvents();
    each(events, (fn, key) => {
      console.log('bind: ', key);
      eventService.on(key, behavior[fn].bind(behavior));
    });
  }
  public static unBindEvents(eventService, behavior) {
    const events = behavior.getEvents();
    each(events, (fn, key) => {
      eventService.off(key, behavior[fn].bind(behavior));
    });
  }
}
