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
