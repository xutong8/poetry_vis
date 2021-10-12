export type EventType =
  | 'mousedown'
  | 'mouseup'
  | 'dblclick'
  | 'mouseout'
  | 'mouseover'
  | 'mousemove'
  | 'mouseleave'
  | 'mouseenter'
  | 'touchstart'
  | 'touchmove'
  | 'touchend'
  | 'dragenter'
  | 'dragover'
  | 'dragleave'
  | 'drop'
  | 'contextmenu'
  | 'mousewheel';

export interface IEventHandler {
  (event: Event): void;
}

export interface IEventListener {
  [eventName: string]: IEventHandler[];
}
