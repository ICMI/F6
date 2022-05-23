import { clone, each, wrapBehavior } from '@antv/util';
import { DragNode } from './drag-node';
import { BehaviorOption } from '../types';

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
