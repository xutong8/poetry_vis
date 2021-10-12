export interface IEventHandler {
  (event: Event): void;
}

export interface IEventListener {
  [eventName: string]: IEventHandler[];
}

export interface IEventPosition {
  x: number;
  y: number;
}
