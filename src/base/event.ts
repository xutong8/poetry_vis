import { IEventHandler, IEventListener } from '@/types/baseEvent';

const EVENTS = [
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
  'mouseout',
  'mouseover',
  'mousemove',
  'mouseleave',
  'mouseenter',
  'touchstart',
  'touchmove',
  'touchend',
  'dragenter',
  'dragover',
  'dragleave',
  'drop',
  'contextmenu',
  'mousewheel'
];

class BaseEvent {
  private _listener: IEventListener = {};

  constructor() {}

  // 绑定事件
  on(type: string, handler: IEventHandler) {
    if (!this._listener[type]) {
      this._listener[type] = [];
    }
    this._listener[type].push(handler);
  }

  // 触发事件
  emit(type: string, event: MouseEvent) {
    console.log('type: ', type);

    // 考虑边界情况
    if (event === null || event.type === null) return;

    // 当前事件类型下的监听器数组
    const handlers = this._listener[type];

    // 如果监听器数组为空，则直接return
    if (!handlers) return;

    handlers.forEach((handler) => {
      handler(event);
    });
  }

  // 解绑事件
  remove(type: string, handler: IEventHandler) {
    // 如果只指定了第一个参数，则清空当前事件类型下的监听器数组
    if (!handler) {
      this._listener[type] = [];
      return;
    }

    const handlers = this._listener[type];

    // 1. 如果当前type没有在_listener中注册过，则为undefined
    if (!handlers) return;

    // 2. 从数组中删除指定handler
    this._listener[type] = handlers.filter((item) => item !== handler);
  }
}

export { BaseEvent, EVENTS };
